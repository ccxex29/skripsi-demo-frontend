import React from 'react';
import styles from '../public/styles/HeaderSeparator.module.sass';

const HeaderSeparator = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.line}>
            </div>
            <div className={styles.compareWrapper}>
                <div className={styles.compareText}>
                    COMPARE
                </div>
            </div>
        </div>
    );
};

export default HeaderSeparator;
