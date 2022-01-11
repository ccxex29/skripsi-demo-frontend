import React, {useEffect, useState} from 'react';
import styles from '../public/styles/Body.module.sass';
import LiveFeedControlButton from './LiveFeedControlButton';
import CameraFeed from './CameraFeed';
import DisplayMetrics from './DisplayMetrics';
import Settings from './Settings';

interface ArchitectureState {
    name?: string,
    confidence?: number,
    detectionResult?: 'drowsy' | 'alert',
}

const architectureDefaultState: ArchitectureState = {
    name: undefined,
    confidence: undefined,
    detectionResult: undefined
}

const Body = () => {
    const [isLiveStarted, setIsLiveStarted] = useState(false);
    const [archOneState, setArchOneState] = useState<ArchitectureState>({...architectureDefaultState});
    const [archTwoState, setArchTwoState] = useState<ArchitectureState>({...architectureDefaultState});

    const handleIsLiveStarted = (e: React.MouseEvent<HTMLElement>) => {
        setIsLiveStarted(prevState => !prevState);
    }

    return (
        <div className={styles.wrapper}>
            <Settings />
            <DisplayMetrics title={`Architecture 1 (${archOneState.name ?? 'N/A'})`} metricData={{
                confidence: archOneState.confidence,
                detectionResult: archTwoState.detectionResult,
            }} align={'left'} />
            <div className={styles.feedArea}>
                <div className={styles.cameraFeedWrapper}>
                    <CameraFeed handleIsLiveStarted={handleIsLiveStarted} isLiveStarted={isLiveStarted} />
                </div>
                <div className={styles.liveFeedControlBtnWrapper}>
                    <LiveFeedControlButton handleIsLiveStarted={handleIsLiveStarted} isLiveStarted={isLiveStarted} />
                </div>
            </div>
            <DisplayMetrics title={`Architecture 2 (${archTwoState.name ?? 'N/A'})`} metricData={{
                confidence: archTwoState.confidence,
                detectionResult: archTwoState.detectionResult,
            }} alignText={'right'} align={'right'} />
        </div>
    );
};

export default Body;
