import React from 'react';
import {FiPause, FiPlay} from 'react-icons/fi';
import styles from '../public/styles/LiveFeedControlButton.module.sass';

interface LiveFeedControlButtonProps {
    readonly isLiveStarted: boolean;
    handleIsLiveStarted: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const LiveFeedControlButton = (props: LiveFeedControlButtonProps) => {
    return (
        <button className={styles.wrapper} onClick={props.handleIsLiveStarted}>
            {
                props.isLiveStarted ? <FiPause /> : <FiPlay />
            }
            <span>LIVE TESTING</span>
        </button>
    );
}

export default LiveFeedControlButton;
