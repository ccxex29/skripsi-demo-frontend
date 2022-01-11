import React, {useEffect, useRef} from 'react';
import styles from '../public/styles/CameraFeed.module.sass';
import {FiCameraOff} from 'react-icons/fi';

interface CameraFeedProps {
    readonly isLiveStarted: boolean;
    handleIsLiveStarted: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface CameraFeedPlayerProps {
    readonly isLiveStarted: boolean;
}

const CameraFeedPlayer = (props: CameraFeedPlayerProps) => {
    const {isLiveStarted} = props;
    const stream = useRef<MediaStream|undefined>();
    const videoElement = useRef<HTMLVideoElement>();
    const constraints = {
        audio: false,
        video: {
            width: 480,
            height: 270
        }
    };

    const initStream = () => {
        try {
            setVideoElementObject();
        } catch (e) {
            console.error(e.message);
        }
    }

    const setVideoElementObject = async () => {
        try {
            if (isLiveStarted) {
                stream.current = await navigator.mediaDevices.getUserMedia(constraints);
                videoElement.current.srcObject = stream.current;
                fetchImage();
                return;
            }
            stream.current.getTracks().forEach(track => track.stop());
        } catch (e) {
            console.error('Stream is probably invalid. Maybe the stream was set/unset too quickly?');
        }
        // videoElement.current.srcObject = undefined;
    }

    const fetchImage = async () => {
        while (true) {
            if (!stream.current || !stream.current.active || !videoElement.current) {
                return;
            }
            const canvas = document.createElement('canvas');
            const canvasCtx = canvas.getContext('2d');
            canvasCtx.drawImage(videoElement.current, 0, 0, 480, 270);
            canvas.toBlob((blob) => {
                console.log(blob);
            }, 'image/webp', 1);
            await (new Promise<void>((resolve) => setTimeout(() => {
                resolve();
            }, 1000)));
        }
    }

    useEffect(() => {
        initStream();
    }, []);
    useEffect(() => {
        setVideoElementObject();
    }, [isLiveStarted]);
    if (props.isLiveStarted) {
        return <video id={'camera-feed'} autoPlay ref={videoElement} height={'100%'} width={'100%'} />;
    }
    return <FiCameraOff color={'#fff'} size={30} />;
}

const CameraFeed = (props: CameraFeedProps) => {
    return (
        <div className={styles.wrapper} onClick={props.handleIsLiveStarted}>
            <CameraFeedPlayer isLiveStarted={props.isLiveStarted} />
        </div>
    );
};

export default CameraFeed;
