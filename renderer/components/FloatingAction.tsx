import React from 'react';
import styles from '../public/styles/FloatingAction.module.sass';

interface FloatingActionProps {
    children: JSX.Element|JSX.Element[];
}
const FloatingAction = (props: FloatingActionProps) => {
    return (
        <div className={styles.wrapper}>
            {props.children}
        </div>
    );
};

export default FloatingAction;
