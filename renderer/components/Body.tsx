import React, {useEffect, useRef, useState} from 'react';
import styles from '../public/styles/Body.module.sass';
import LiveFeedControlButton from './LiveFeedControlButton';
import CameraFeed from './CameraFeed';
import DisplayMetrics from './DisplayMetrics';
import Settings from './Settings';
import {FaceDetectionPosition} from '../interfaces/FaceDetectionPosition';
import {connect} from 'react-redux';
import {Prediction} from '../interfaces/Prediction';

const mapStateToProps = (state: {'face_detection': {position: FaceDetectionPosition}, predictions: {'prediction_a': Prediction, 'prediction_b': Prediction}}) => {
    return {
        position: state['face_detection'].position,
        predictions: state.predictions,
    }
}

const Body = (props) => {
    const [isLiveStarted, setIsLiveStarted] = useState(false);

    const predictionA = props.predictions['prediction_a'];
    const predictionB = props.predictions['prediction_b'];

    const handleIsLiveStarted = (e: React.MouseEvent<HTMLElement>) => {
        setIsLiveStarted(prevState => !prevState);
    }

    return (
        <div className={styles.wrapper}>
            <Settings />
            <DisplayMetrics title={`Architecture 1 (${predictionA?.canonicalName ?? 'N/A'})`} metricData={{
                confidence: predictionA?.confidence,
                detectionResult: predictionA?.result,
            }} align={'left'} />
            <div className={styles.feedArea}>
                <div className={styles.cameraFeedWrapper}>
                    <CameraFeed handleIsLiveStarted={handleIsLiveStarted} isLiveStarted={isLiveStarted} />
                </div>
                <div className={styles.liveFeedControlBtnWrapper}>
                    <LiveFeedControlButton handleIsLiveStarted={handleIsLiveStarted} isLiveStarted={isLiveStarted} />
                </div>
            </div>
            <DisplayMetrics title={`Architecture 2 (${predictionB?.canonicalName ?? 'N/A'})`} metricData={{
                confidence: predictionB?.confidence,
                detectionResult: predictionB?.result,
            }} alignText={'right'} align={'right'} />
        </div>
    );
};

export default connect(mapStateToProps, null)(Body);
