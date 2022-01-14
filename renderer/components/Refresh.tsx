import React from 'react';
import buttonStyles from '../public/styles/FloatingAction.module.sass';
import {FiRefreshCw} from 'react-icons/fi';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {triggerRefresh} from '../redux/refresh';
import {connect} from 'react-redux';

interface RefreshProps {
    triggerRefresh: () => void;
}

const mapDispatchToProps = (dispatch: ThunkDispatch<void, unknown, AnyAction>) => {
    return {
        triggerRefresh: () => dispatch(triggerRefresh()),
    }
}

const Refresh = (props: RefreshProps) => {
    return (
        <div>
            <div className={buttonStyles.switchBtn} onClick={props.triggerRefresh}>
                <FiRefreshCw size={20} />
            </div>
        </div>
    );
}

export default connect(null, mapDispatchToProps)(Refresh);
