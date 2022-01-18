import React, {ChangeEvent, useState} from 'react';
import {FiEdit, FiRepeat, FiSave, FiSettings} from 'react-icons/fi';
import styles from '../public/styles/Settings.module.sass';
import buttonStyles from '../public/styles/FloatingAction.module.sass';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {setOneConfig} from '../redux/config';
import defaults from '../strings/defaults';
import {ConfigObjects} from '../interfaces/Config';

interface SettingsListItem {
    name: string;
    type: 'text'|'checkbox';
    state?: boolean;
    flipState?: () => void;
    handler: (ev: ChangeEvent) => void;
    value: string|number|boolean;
    resetHandler: () => void;
    saveIcon?: JSX.Element;
    editIcon?: JSX.Element;
    resetIcon?: JSX.Element;
}

interface SettingsProps {
    readonly config: ConfigObjects;
    readonly setHost: (url: string) => void;
    readonly setLogging: (shouldLog: boolean) => void;
}

const mapStateToProps = (state: {config: object}) => {
    return {
        config: state.config,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<string|boolean, unknown, AnyAction>) => {
    return {
        setHost: (url: string) => dispatch(setOneConfig({'backend:host': url})),
        setLogging: (shouldLog: boolean) => dispatch(setOneConfig({'backend:logging': shouldLog})),
    }
}

const Settings = (props: SettingsProps) => {
    const [editingHostUrl, setEditingHostUrl] = useState(false)
    const settingsList: SettingsListItem[] = [
        {
            name: 'Host',
            type: 'text',
            state: editingHostUrl,
            flipState: () => {
                setEditingHostUrl(!editingHostUrl)
            },
            handler: (e: ChangeEvent<HTMLInputElement>) => {
                props.setHost(e.target.value);
            },
            resetHandler: () => {
                props.setHost(defaults.HOST_URL)
            },
            value: props.config?.backend?.host,
            saveIcon: <FiSave />,
            editIcon: <FiEdit />,
            resetIcon: <FiRepeat />,
        },
        {
            name: 'Server Log',
            type: 'checkbox',
            handler: () => {
                const logging = !props.config?.backend?.logging;
                if (logging === undefined) {
                    return;
                }
                if (logging && !confirm('Enabling server log means sending your face to the server.\nHowever, any of the logged data would not publicised unless you allow us to.')) {
                    return;
                }
                props.setLogging(logging);
            },
            resetHandler: () => {
                props.setLogging(defaults.HOST_LOGGING)
            },
            value: props.config?.backend?.logging
        }
    ];
    const [showSettings, setShowSettings] = useState(false);
    const renderSettingsList = (): JSX.Element[] => {
        const jsxList: JSX.Element[] = [];
        for (const item of settingsList) {
            console.log(item.value);
            let itemElement = null;
            if (item.state === undefined) {
                // @ts-ignore
                itemElement = <input type={item.type} value={item.value} checked={item.value} onChange={item.handler}/> // Default
            } else if (item.type === 'text') {
                if (item.state) {
                    itemElement = <>
                        {/* @ts-ignore */}
                        <input type={item.type} value={item.value} onChange={item.handler}/>
                        <button onClick={item.flipState}>{item.saveIcon ?? 'Save'}</button>
                    </>
                } else if (!item.state) {
                    itemElement = <>
                        <span>{item.value ?? ''}</span>
                        <button onClick={item.flipState}>{item.editIcon ?? 'Edit'}</button>
                        <button onClick={item.resetHandler}>{item.resetIcon ?? 'Reset'}</button>
                    </>
                }
            }
            jsxList.push(
                <React.Fragment key={item.name}>
                    <span>{item.name}
                    </span>
                    <div className={styles.alignListValue}>
                        { itemElement }
                    </div>
                </React.Fragment>
            );
        }
        return jsxList;
    }
    const handleFlipShowSettings = () => {
        setShowSettings(prevState => !prevState);
    };
    return (
        <div>
            <div className={`${styles.popup} ${!showSettings ? styles.popupHidden : undefined}`}>
                <div className={styles.popupTitle}>
                    Settings
                </div>
                <hr />
                <div className={styles.popupList}>
                    {renderSettingsList()}
                </div>
            </div>
            <div className={buttonStyles.switchBtn} onClick={handleFlipShowSettings}>
                <FiSettings size={20} />
            </div>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
