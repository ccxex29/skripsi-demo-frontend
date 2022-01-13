import React, {useState} from 'react';
import {FiSettings} from 'react-icons/fi';
import styles from '../public/styles/Settings.module.sass';

interface SettingsListItem {
    name: string,
    type: 'text'|'checkbox',
    handler?: (value?: string|boolean|null) => void,
}

const Settings = () => {
    const settingsList: SettingsListItem[] = [
        {
            name: 'Host',
            type: 'text'
        },
        {
            name: 'Local Log',
            type: 'checkbox'
        }
    ];
    const [showSettings, setShowSettings] = useState(false);
    const renderSettingsList = (): JSX.Element[] => {
        const jsxList: JSX.Element[] = [];
        for (const item of settingsList) {
            jsxList.push(
                <React.Fragment key={item.name}>
                    <span>{item.name}
                    </span>
                    <div className={styles.alignListValue}>
                        <input type={item.type} />
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
        <div className={styles.wrapper}>
            <div className={`${styles.popup} ${!showSettings ? styles.popupHidden : undefined}`}>
                <div className={styles.popupTitle}>
                    Settings
                </div>
                <hr />
                <div className={styles.popupList}>
                    {renderSettingsList()}
                </div>
            </div>
            <div className={styles.switchBtn} onClick={handleFlipShowSettings}>
                <FiSettings size={20} />
            </div>
        </div>
    );
};

export default Settings;
