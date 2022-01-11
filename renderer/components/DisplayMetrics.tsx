import React from 'react';
import styles from '../public/styles/DisplayMetrics.module.sass';

interface DisplayMetricsProps {
    title: string;
    metricData: {
        confidence?: number,
        detectionResult?: 'drowsy' | 'alert',
    };
    alignText?: 'left' | 'center' | 'right',
    align?: 'left' | 'right',
}

const DisplayMetrics = (props: DisplayMetricsProps) => {
    return (
        <div className={styles.wrapper} style={{
            textAlign: props.alignText ?? 'left',
            left: props.align === 'left' ? 0 : 'unset',
            right: props.align === 'right' ? 0 : 'unset',
        }}>
            <div className={styles.title}>{props.title}</div>
            <p className={styles.body}>Detected: {props.metricData.detectionResult ?? 'N/A'}</p>
            <p className={styles.body}>Confidence: {props.metricData.confidence ? (props.metricData.confidence * 100) + ' %' : 'N/A'}</p>
        </div>
    );
};

export default DisplayMetrics;
