import React from 'react';
import styles from '../public/styles/HeaderSeparator.module.sass';
import {ArchitectureModeType} from '../interfaces/ArchitectureMode';
import {flipArchitectureMode} from '../redux/architectureMode';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';

interface HeaderSeparatorProps {
    readonly architectureMode: ArchitectureModeType,
    flipArchitectureMode: () => void,
}

const mapStateToProps = (state: {architectureMode: ArchitectureModeType}) => {
    return {
        architectureMode: state.architectureMode,
    }
}
const mapDispatchToProps = (dispatch: ThunkDispatch<void, unknown, AnyAction>) => {
    return {
        flipArchitectureMode: (): void => {
            dispatch(flipArchitectureMode());
            return;
        },
    }
}

const HeaderSeparator = (props: HeaderSeparatorProps) => {
    return (
        <div className={styles.wrapper} onClick={props.flipArchitectureMode}>
            <div className={styles.line}>
            </div>
            <div className={styles.compareWrapper}>
                <div className={styles.compareText}>
                    {
                        props.architectureMode === 'compare' ? 'COMPARE' : 'SINGLE'
                    }
                </div>
                <div className={styles.modeText}>
                    MODE
                </div>
            </div>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderSeparator);
