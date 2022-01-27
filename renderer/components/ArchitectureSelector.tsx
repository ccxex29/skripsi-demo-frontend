import React, {useEffect, useRef, useState} from 'react';
import AsyncSelect from 'react-select/async';
import styles from '../public/styles/ArchitectureSelector.module.sass';
import {ArchitectureOption, ModelType, SelectedModels, SelectedModelType} from '../interfaces/Model';
import {Profile, ProfileList} from '../interfaces/Profile';
import {setModel} from '../redux/model';
import {connect} from 'react-redux';
import {ArchitectureModeType} from '../interfaces/ArchitectureMode';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {ConfigObjects} from '../interfaces/Config';
import colours from '../strings/colours';
import {setProfiles} from '../redux/profile';

interface PropsType {
    readonly alignment: string;
    readonly isArchitectureA?: boolean;
    readonly isArchitectureB?: boolean;
    readonly selectedModels?: SelectedModels;
    readonly selectedModel?: SelectedModelType;
    readonly architectureMode: ArchitectureModeType;
    readonly refreshId: string;
    readonly config: ConfigObjects;
    readonly profiles: ProfileList;
    readonly profile: Profile;
    readonly setModel: (model: ModelType) => void;
    readonly setProfiles: (profiles: ProfileList) => void;
}

const mapStateToProps = (state: { config: ConfigObjects, refreshId: string, architectureMode: ArchitectureModeType, selectedModels: SelectedModels, selected_profile: Profile, profiles: ProfileList }) => {
    return {
        architectureMode: state.architectureMode,
        selectedModels: state.selectedModels,
        refreshId: state.refreshId,
        config: state.config,
        profiles: state.profiles,
        profile: state.selected_profile,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<ModelType|ProfileList, unknown, AnyAction>) => {
    return {
        setModel: (model: ModelType) => dispatch(setModel(model)),
        setProfiles: (profiles: ProfileList) => dispatch(setProfiles(profiles)),
    }
};

const getFlexAlignment = (alignment: string) => {
    if (alignment === 'left') {
        return 'flex-start';
    } else if (alignment === 'right') {
        return 'flex-end';
    }
    return alignment;
}

interface GetArchitectureData {
    data: {
        model_list: object,
        profile_list: ProfileList,
    };
}

const ArchitectureSelector = (props: PropsType) => {
    const isFirstLoadArchitecture = useRef(true);
    const isFirstLoadProfile = useRef(true);
    const [architectureList, setArchitectureList] = useState([]);
    const [currentArchitecture, setCurrentArchitecture] = useState<SelectedModelType>();

    useEffect(() => {
        if (isFirstLoadProfile.current) {
            isFirstLoadProfile.current = false;
            return;
        }
        const nameKey = props.isArchitectureA ? 0 : 1;
        const name = props.profiles[props.profile][nameKey];
        const label = architectureList.filter(arch => arch['value'] === name)[0]['label'];
        props.setModel({
            value: {
                value: name,
                label: label,
            },
            target: !nameKey ? 'a' : 'b',
        });
    }, [props.profile]);

    useEffect(() => {
        if (isFirstLoadArchitecture.current) {
            isFirstLoadArchitecture.current = false;
            return;
        }
        setCurrentArchitecture(props.selectedModel);
    }, [props.selectedModel])

    useEffect(() => {
        if (!props.isArchitectureB || props.architectureMode === 'compare') {
            return;
        }
        if (props.selectedModels.model_a !== props.selectedModels.model_b) {
            handleChangeSelect(props.selectedModels.model_a);
        }
    }, [props.architectureMode])

    const getArchitectureList = () => {
        const selectedHost: string = props.config?.backend?.host;
        if (!selectedHost) {
            return;
        }
        return fetch(`http${selectedHost.startsWith('localhost') ? '' : 's'}://${selectedHost}/`)
            .then(response => response.json())
            .then((data: GetArchitectureData) => {
                const keys = Object.keys(data['data']['model_list']);
                const selectData = keys.map(key => {
                    return {
                        value: key,
                        label: data['data']['model_list'][key]
                    }
                });
                const firstSelectData = selectData?.[0] ?? {
                    value: undefined,
                    label: undefined,
                };
                setCurrentArchitecture(firstSelectData);
                setArchitectureList(selectData);
                props.setModel({
                    value: firstSelectData,
                    target: props.isArchitectureA ? 'a' : 'b'
                });
                props.setProfiles(data['data']['profile_list']);
                return selectData;
            })
            .catch((err) => {
                console.error(err);
                return [];
            });
    }
    const handleChangeSelect = (value: ArchitectureOption) => {
        const targets = props.architectureMode === 'single' ? ['a', 'b'] : (props.isArchitectureA ? ['a'] : ['b']);
        for (const target of targets) {
            props.setModel({
                value: value,
                target: target
            });
        }
    };

    return (
        <div id={`sel-arch-${props.alignment}`} className={styles.wrapper} style={{
            alignItems: getFlexAlignment(props.alignment),
        }}>
            <div className={styles.selectLabel}>
                SELECT ARCHITECTURE
            </div>
            <AsyncSelect
                key={`sel-arch-${props.alignment}-select-${props.refreshId}`}
                instanceId={`sel-arch-${props.alignment}-select`}
                cacheOptions
                className={styles.select}
                onChange={handleChangeSelect}
                value={currentArchitecture}
                loadOptions={getArchitectureList.bind(this)}
                getOptionValue={(option: ArchitectureOption) => option.value}
                getOptionLabel={(option: ArchitectureOption) => option.label}
                filterOption={() => true}
                defaultOptions
                placeholder={'Select Architecture...'}
                isSearchable={false}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary: colours['yellow-1'],
                        primary75: colours['yellow-1'] + 'BF',
                        primary50: colours['yellow-1'] + '7F',
                        primary25: colours['yellow-1'] + '3F',
                    }
                })}
            />
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(ArchitectureSelector);
