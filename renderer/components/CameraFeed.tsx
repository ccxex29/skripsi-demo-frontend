import React, {MutableRefObject, Ref, useEffect, useRef, useState} from 'react';
import styles from '../public/styles/CameraFeed.module.sass';
import {FiCameraOff} from 'react-icons/fi';
import {SelectedModels} from '../interfaces/Model';
import {connect} from 'react-redux';
import {setPrediction} from '../redux/prediction';
import {Prediction, PredictionType} from '../interfaces/Prediction';
import {FaceDetectionPosition} from '../interfaces/FaceDetectionPosition';
import {setFaceDetectionPosition} from '../redux/faceDetectionPosition';
import {PositionType} from '../interfaces/Position';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {PredictionSocketPayload} from '../interfaces/SocketPayload';
import {IOptions} from 'nconf';
import defaults from '../strings/defaults';

interface CameraFeedProps {
    readonly isLiveStarted: boolean;
    readonly selectedModels: SelectedModels;
    readonly position: PositionType;
    readonly predictions: {
        'prediction_a': Prediction,
        'prediction_b': Prediction,
    };
    readonly config: IOptions;
    setPrediction: (prediction: PredictionType) => void;
    setFaceDetectionPosition: (position: FaceDetectionPosition) => void;
    handleIsLiveStarted: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

interface CameraFeedPlayerProps {
    readonly isLiveStarted: boolean;
    readonly hostUrl: string;
    readonly selectedModels: SelectedModels;
    readonly position: PositionType;
    readonly predictions: {
        'prediction_a': Prediction,
        'prediction_b': Prediction,
    };
    readonly config: IOptions;
    setPrediction: (prediction: PredictionType) => void;
    setFaceDetectionPosition: (position: FaceDetectionPosition) => void;
    handleIsLiveStarted: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

interface FaceDetectionSquareProps {
    readonly position: PositionType;
    videoElement: MutableRefObject<HTMLVideoElement | undefined>;
}

const FRAMES_PER_SECOND = 12

const MESSAGE_REFRESH_TIMINGS = {
    minRoundaboutDelaySecs: 1 / FRAMES_PER_SECOND,
    maxRefreshTimes: FRAMES_PER_SECOND,
    restoreRefreshIterationSecs: 1,
}

const mapStateToProps = (state: { config: IOptions, selectedModels: SelectedModels, face_detection: { position: PositionType }, predictions: { 'prediction_a': Prediction, 'prediction_b': Prediction } }) => {
    return {
        selectedModels: state.selectedModels,
        position: state['face_detection'].position,
        predictions: state.predictions,
        config: state.config,
    }
};

const mapDispatchToProps = (dispatch: ThunkDispatch<PredictionType | FaceDetectionPosition, unknown, AnyAction>) => {
    return {
        setPrediction: (prediction: PredictionType) => dispatch(setPrediction(prediction)),
        setFaceDetectionPosition: (position: FaceDetectionPosition) => dispatch(setFaceDetectionPosition(position)),
    }
};

const CameraFeedPlayer = (props: CameraFeedPlayerProps) => {
    const socket = useRef<WebSocket | undefined>();
    const {isLiveStarted} = props;
    const isLiveStartedFirstRun = useRef(true);
    const stream = useRef<MediaStream | undefined>();
    const videoElement = useRef<HTMLVideoElement>();
    let isWaiting = false;

    let lastRestoredRefreshTime: number = (new Date()).getTime();
    let lastMessageSendTime: number = undefined;
    let refreshTimes = MESSAGE_REFRESH_TIMINGS.maxRefreshTimes;

    const constraints = {
        audio: false,
        video: {
            width: 480,
            height: 270,
        },
    };

    /**
     * Pause Function that returns a Promise of a function which has been wrapped inside setTimeout
     * @param callback
     * @param delay
     */
    const pauseTime = (callback: () => void, delay: number) => {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                callback();
                resolve();
            }, delay);
        });
    }

    const getTime = () => {
        return (new Date()).getTime();
    }

    const updateLastMessageSendTime = () => {
        lastMessageSendTime = (new Date()).getTime();
    }

    const updateLastRestoredRefreshTime = () => {
        lastRestoredRefreshTime = (new Date()).getTime();
    }

    const setVideoElementObject = async () => {
        try {
            if (isLiveStarted) {
                openSocket();
                stream.current = await navigator.mediaDevices.getUserMedia(constraints);
                videoElement.current.srcObject = stream.current;
                setTimeout(requestToServer, 0);
                return;
            }
            closeSocket();
            stream.current.getTracks().forEach(track => track.stop());
            resetDetectionAndRecognitionData();
        } catch (e) {
            console.error('Stream is probably invalid. Maybe the stream was set/unset too quickly?');
        }
    }

    const isStreamInactive = () => {
        return !stream.current || !stream.current.active || !videoElement.current;
    }

    /**
     * Refresh Limiter Count Restoration
     */
    const refreshLimitRefresher = () => {
        if (isSocketOffline() || isStreamInactive()) {
            return;
        }
        pauseTime(() => {
            refreshTimes = MESSAGE_REFRESH_TIMINGS.maxRefreshTimes;
            updateLastRestoredRefreshTime();
            refreshLimitRefresher();
        }, MESSAGE_REFRESH_TIMINGS.restoreRefreshIterationSecs * 1000)
            .catch(err => console.error(err));
    }

    /**
     * Fetch Loop Logic
     */
    const fetchLoop = () => {
        if (isSocketOffline() || isStreamInactive()) {
            return;
        }
        if (!isSocketReady() || isWaiting) {
            console.warn('Waiting for server to keep up. Is the server lagging?');
            pauseTime(fetchLoop, MESSAGE_REFRESH_TIMINGS.minRoundaboutDelaySecs * 1000)
                .catch(err => console.error(err));
            return;
        }
        if (refreshTimes < 1) {
            pauseTime(fetchLoop, lastRestoredRefreshTime + (MESSAGE_REFRESH_TIMINGS.restoreRefreshIterationSecs * 1000) - (new Date()).getTime())
                .catch(err => console.error(err));
            return;
        }
        updateLastMessageSendTime();
        isWaiting = true;
        refreshTimes--;
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const base64Image: string = getNewImage().next().value;
        const objectWsPayload: PredictionSocketPayload = {
            architecture_a: props.selectedModels?.['model_a']?.value,
            architecture_b: props.selectedModels?.['model_b']?.value,
            image: base64Image.replace(/^.+,/, ''),
            logging: props.config?.backend?.logging ?? defaults.HOST_LOGGING,
        };
        const wsPayload: string = JSON.stringify(objectWsPayload);
        socket.current.send(wsPayload);
        // pauseTime(fetchLoop, MESSAGE_REFRESH_TIMINGS.minRoundaboutDelaySecs * 1000)
        //     .catch(err => console.error(err));
    }

    const requestToServer = () => {
        refreshLimitRefresher();
        fetchLoop();
    }

    function* getNewImage(): Generator<string> {
        yield fetchImage() ?? '';
    }

    const fetchImage = (): string => {
        if (isStreamInactive()) {
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', videoElement.current.videoWidth.toString());
        canvas.setAttribute('height', videoElement.current.videoHeight.toString());
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.drawImage(videoElement.current, 0, 0, videoElement.current.videoWidth, videoElement.current.videoHeight);
        return canvas.toDataURL('image/webp', .7);
    };

    const resetDetectionAndRecognitionData = () => {
        resetFacePositionData();
        resetPredictionData();
    }
    const resetFacePositionData = () => {
        props.setFaceDetectionPosition({
            x: undefined,
            y: undefined,
            w: undefined,
            h: undefined,
        });
    }

    const resetPredictionData = () => {
        props.setPrediction({
            ...props.predictions?.['prediction_a'],
            result: undefined,
            confidence: undefined,
            target: 'a',
        });
        props.setPrediction({
            ...props.predictions?.['prediction_b'],
            result: undefined,
            confidence: undefined,
            target: 'b',
        });
    }

    const openSocket = () => {
        const selectedHost: string = props.hostUrl ?? defaults.HOST_URL;
        socket.current = new WebSocket(`ws${selectedHost.startsWith('localhost') ? '' : 's'}://${selectedHost}/ws`);
        socket.current.onopen = () => console.info('socket connected');
        socket.current.onclose = () => {
            resetPredictionData();
            console.info('socket disconnected');
        }
        socket.current.onmessage = (msgEvent) => {
            const msgEventData = msgEvent?.data;
            if (typeof msgEventData !== 'string') {
                return;
            }
            const serverMessage = JSON.parse(msgEventData);
            if (serverMessage?.status === 'done') {
                isWaiting = false;
                const deltaTime = getTime() - lastMessageSendTime
                let pauseFor = -(deltaTime - (MESSAGE_REFRESH_TIMINGS.minRoundaboutDelaySecs * 1000));
                pauseFor = pauseFor < 0 ? 0 : pauseFor;
                const skippedFrames = (deltaTime / MESSAGE_REFRESH_TIMINGS.minRoundaboutDelaySecs / 1000).toFixed();
                if (skippedFrames !== '0') {
                    console.warn(`Skipped ${skippedFrames} frames`);
                }
                pauseTime(fetchLoop, pauseFor)
                    .catch(err => console.error(err));
            } else if (serverMessage?.status === 'error') {
                resetFacePositionData();
            } else if (serverMessage?.status === 'success') {
                if (serverMessage?.data?.position) {
                    props.setFaceDetectionPosition({
                        x: serverMessage?.data?.position?.x ?? undefined,
                        y: serverMessage?.data?.position?.y ?? undefined,
                        w: serverMessage?.data?.position?.w ?? undefined,
                        h: serverMessage?.data?.position?.h ?? undefined,
                    });
                }
                if (serverMessage?.data?.architecture_a) {
                    props.setPrediction({
                        canonicalName: serverMessage?.data?.architecture_a?.canonical_name,
                        result: serverMessage?.data?.architecture_a?.detection,
                        confidence: serverMessage?.data?.architecture_a?.confidence,
                        target: 'a',
                    });
                }
                if (serverMessage?.data?.architecture_b) {
                    props.setPrediction({
                        canonicalName: serverMessage?.data?.architecture_b?.canonical_name,
                        result: serverMessage?.data?.architecture_b?.detection,
                        confidence: serverMessage?.data?.architecture_b?.confidence,
                        target: 'b',
                    });
                }
            }
        }
    }

    const closeSocket = () => {
        isWaiting = false
        socket.current.close();
    }

    const isSocketReady = () => socket.current.readyState === socket.current.OPEN;
    const isSocketOffline = () => socket.current.readyState > socket.current.OPEN; // Covers CLOSING and CLOSED states


    useEffect(() => {
        if (isLiveStartedFirstRun.current) {
            isLiveStartedFirstRun.current = false;
            return;
        }
        setVideoElementObject()
            .catch(err => console.error(err));
    }, [isLiveStarted]);

    if (props.isLiveStarted) {
        return (
            <div style={{width: '100%', height: '100%'}}>
                <FaceDetectionSquare position={props.position} videoElement={videoElement}/>
                <video id={'camera-feed'} autoPlay ref={videoElement} height={'100%'} width={'100%'}/>
            </div>
        )
    }
    return <FiCameraOff color={'#fff'} size={30}/>;
}

const FaceDetectionSquare = (props: FaceDetectionSquareProps) => {
    const position: PositionType = props.position;
    const videoElement: Ref<HTMLVideoElement> = props.videoElement;

    if (!videoElement.current || position?.x === undefined || position?.y === undefined || position?.w === undefined || position?.h === undefined) {
        return <></>
    }
    return (
        <div style={{
            position: 'absolute',
            left: position.x / videoElement.current.videoWidth * videoElement.current.offsetWidth ?? 0,
            top: position.y / videoElement.current.videoHeight * videoElement.current.offsetHeight ?? 0,
            width: position.w / videoElement.current.videoWidth * videoElement.current.offsetWidth ?? 0,
            height: position.h / videoElement.current.videoHeight * videoElement.current.offsetHeight ?? 0,
            border: '2px solid #ff0000',
            color: '#FFF',
            zIndex: 10,
        }}/>
    );
};

const CameraFeed = (props: CameraFeedProps) => {
    const [hostUrl, setHostUrl] = useState(defaults.HOST_URL);
    useEffect(() => {
        if (! Object.entries(props.config).length) {
            return;
        }
        const hostUrl = props.config?.backend?.host ?? defaults.HOST_URL;
        if (typeof hostUrl !== 'string') {
            return;
        }
        setHostUrl(hostUrl);
    }, [props.config]);
    return (
        <div className={styles.wrapper} onClick={props.handleIsLiveStarted}>
            <CameraFeedPlayer
                position={props.position}
                predictions={props.predictions}
                isLiveStarted={props.isLiveStarted}
                selectedModels={props.selectedModels}
                setPrediction={props.setPrediction}
                setFaceDetectionPosition={props.setFaceDetectionPosition}
                handleIsLiveStarted={props.handleIsLiveStarted}
                hostUrl={hostUrl}
                config={props.config}
            />
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraFeed);
