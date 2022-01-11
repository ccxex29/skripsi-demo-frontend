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

interface CameraFeedProps {
    readonly isLiveStarted: boolean;
    readonly selectedModels: SelectedModels;
    readonly position: PositionType;
    readonly predictions: {
        'prediction_a': Prediction,
        'prediction_b': Prediction,
    };
    setPrediction: (prediction: PredictionType) => void;
    setFaceDetectionPosition: (position: FaceDetectionPosition) => void;
    handleIsLiveStarted: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface CameraFeedPlayerProps {
    readonly isLiveStarted: boolean;
    readonly selectedModels: SelectedModels;
    readonly position: PositionType;
    readonly predictions: {
        'prediction_a': Prediction,
        'prediction_b': Prediction,
    };
    setPrediction: (prediction: PredictionType) => void;
    setFaceDetectionPosition: (position: FaceDetectionPosition) => void;
}

interface FaceDetectionSquareProps {
    readonly position: PositionType;
    videoElement: MutableRefObject<HTMLVideoElement|undefined>;
}

const mapStateToProps = (state: { selectedModels: SelectedModels, position: PositionType, predictions: {'prediction_a': Prediction, 'prediction_b': Prediction} }) => {
    return {
        selectedModels: state.selectedModels,
        position: state['face_detection'].position,
        predictions: state.predictions,
    }
};

const mapDispatchToProps = (dispatch) => {
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
    const [isWaitingServerResponse, setIsWaitingServerResponse] = useState(false);

    const constraints = {
        audio: false,
        video: {
            width: 480,
            height: 270,
        },
    };

    const setVideoElementObject = async () => {
        try {
            if (isLiveStarted) {
                stream.current = await navigator.mediaDevices.getUserMedia(constraints);
                videoElement.current.srcObject = stream.current;
                requestToServer();
                return;
            }
            stream.current.getTracks().forEach(track => track.stop());
            resetDetectionAndRecognitionData();
        } catch (e) {
            console.error('Stream is probably invalid. Maybe the stream was set/unset too quickly?');
        }
        // videoElement.current.srcObject = undefined;
    }

    const isStreamInactive = () => {
        return !stream.current || !stream.current.active || !videoElement.current;
    }

    const requestToServer = async () => {
        const minRoundaboutDelaySecs = .5;
        const maxRefreshTimes = 5;
        const restoreRefreshIterationSecs = 5;
        let lastRestoredRefreshTime = (new Date()).getTime()
        let refreshTimes = maxRefreshTimes;

        const pauseTime = (callback: () => void, delay: number) => {
            return new Promise<void>(resolve => {
                setTimeout(() => {
                    callback();
                    resolve();
                }, delay);
            });
        }

        new Promise<void>(async (resolve) => {
            while (true) {
                console.log('loop ref')
                if (isStreamInactive()) {
                    resolve();
                    return;
                }
                await pauseTime(() => {
                    refreshTimes = maxRefreshTimes;
                    lastRestoredRefreshTime = (new Date()).getTime();
                }, restoreRefreshIterationSecs * 1000);
            }
        })

        while (true) {
            console.log('loop req')
            if (isStreamInactive()) {
                return;
            }
            if (isWaitingServerResponse) {
                console.log('waiting for server')
                await pauseTime(() => {
                }, minRoundaboutDelaySecs * 1000);
                continue;
            }
            if (!refreshTimes) {
                await pauseTime(() => {
                }, lastRestoredRefreshTime + (restoreRefreshIterationSecs * 1000) - (new Date()).getTime());
            }
            setIsWaitingServerResponse(true);
            refreshTimes--;
            const base64Image = getNewImage().next().value;
            const wsPayload = JSON.stringify({
                architecture_a: props.selectedModels.model_a,
                architecture_b: props.selectedModels.model_b,
                image: base64Image.replace(/^.+,/, ''),
            });
            socket.current.send(wsPayload);
            await pauseTime(() => {
            }, minRoundaboutDelaySecs * 1000);
        }
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
        return canvas.toDataURL('image/webp', 1);
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
             h: undefined
         });
     }

     const resetPredictionData = () => {
         props.setPrediction({
             ...props.predictions?.['prediction_a'],
             result: undefined,
             confidence: undefined,
             target: 'a'
         });
         props.setPrediction({
             ...props.predictions?.['prediction_b'],
             result: undefined,
             confidence: undefined,
             target: 'b'
         });
     }

    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:8889/ws');
        socket.current.onopen = () => console.log('connected');
        socket.current.onclose = () => {
            resetPredictionData();
            console.log('disconnected');
        }
        socket.current.onmessage = (msgEvent) => {
            const serverMessage = JSON.parse(msgEvent.data);
            if (serverMessage.status === 'done') {
                setIsWaitingServerResponse(false);
            } else if (serverMessage.status === 'error') {
                resetFacePositionData();
            } else if (serverMessage.status === 'success') {
                if (serverMessage.data.position) {
                    props.setFaceDetectionPosition(serverMessage.data.position);
                }
                if (serverMessage.data.architecture_a) {
                    props.setPrediction({
                        canonicalName: serverMessage.data.architecture_a.canonical_name,
                        result: serverMessage.data.architecture_a.detection,
                        confidence: serverMessage.data.architecture_a.confidence,
                        target: 'a',
                    });
                }
                if (serverMessage.data.architecture_b) {
                    props.setPrediction({
                        canonicalName: serverMessage.data.architecture_b.canonical_name,
                        result: serverMessage.data.architecture_b.detection,
                        confidence: serverMessage.data.architecture_b.confidence,
                        target: 'b',
                    });
                }
            }
        }
        return () => {
            socket.current.close();
        }
    }, []);

    useEffect(() => {
        if (isLiveStartedFirstRun.current) {
            isLiveStartedFirstRun.current = false;
            return;
        }
        setVideoElementObject();
    }, [isLiveStarted]);

    if (props.isLiveStarted) {
        return <div style={{width: '100%', height: '100%'}}>
            <FaceDetectionSquare position={props.position} videoElement={videoElement} />
            <video id={'camera-feed'} autoPlay ref={videoElement} height={'100%'} width={'100%'}/>
        </div>
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
    return (
        <div className={styles.wrapper} onClick={props.handleIsLiveStarted}>
            <CameraFeedPlayer
                position={props.position}
                predictions={props.predictions}
                isLiveStarted={props.isLiveStarted}
                selectedModels={props.selectedModels}
                setPrediction={props.setPrediction}
                setFaceDetectionPosition={props.setFaceDetectionPosition}
            />
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraFeed);
