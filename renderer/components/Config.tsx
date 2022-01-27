import React, {useEffect, useRef} from 'react';
import nconf, {IOptions} from 'nconf';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {setConfig} from '../redux/config';
import getAppDataPath from 'appdata-path';
import {name as packageName} from '../../package.json';
import {join} from 'path';
import defaults from '../strings/defaults';
import {triggerRefresh} from '../redux/refresh';

interface IndexProps {
    readonly config: IOptions;
    children: JSX.Element[];
    setConfig: (IOptions) => void;
    triggerRefresh: () => void;
}

const mapStateToProps = (state: {config: IOptions}) => {
    return {
        config: state.config,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<IOptions, unknown, AnyAction>) => {
    return {
        setConfig: (config: IOptions) => dispatch(setConfig(config)),
        triggerRefresh: () => dispatch(triggerRefresh()),
    }
}

const Config = (props: IndexProps) => {
    const isFirstEffect = useRef(true);
    const setConfigFromState = (options: IOptions) => {
        for (const [key, value] of Object.entries(options)) {
            nconf.set(key, value);
        }
    }
    const saveNconf = () => {
        nconf.save((err: Error) => {
            if (err) {
                console.error(err.message);
                return;
            }
        });
    }
    useEffect(() => {
        const manualNconfSetDefault = (options: IOptions) => {
            for (const [key, value] of Object.entries(options)) {
                nconf.set(key, nconf.get(key) ?? value);
            }
        }
        nconf
            .file('config', {
                file: join(getAppDataPath(packageName), defaults.CONFIG_FILENAME),
            });
        manualNconfSetDefault({
            'backend:host': nconf.get('backend:host') ?? defaults.HOST_URL,
            'backend:logging': false,
        });
        props.setConfig(nconf.get());
        saveNconf();
        props.triggerRefresh();
    }, []);
    useEffect(() => {
        if (isFirstEffect.current) {
            isFirstEffect.current = false;
        }
        setConfigFromState(props.config);
        saveNconf();
    }, [props.config]);
    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Config);
