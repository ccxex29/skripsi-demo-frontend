import React, {useEffect, useRef, useState} from 'react';
import AsyncSelect from 'react-select/async';
import styles from '../public/styles/ArchitectureSelector.module.sass';
import {ArchitectureOption, ModelType, SelectedModels, SelectedModelType} from '../interfaces/Model';
import {setModel} from '../redux/model';
import {connect} from 'react-redux';
import {ArchitectureModeType} from '../interfaces/ArchitectureMode';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {ConfigObjects} from '../interfaces/Config';
import defaults from '../strings/defaults';
import colours from '../strings/colours';

interface PropsType {
    readonly alignment: string;
    readonly isArchitectureA?: boolean;
    readonly isArchitectureB?: boolean;
    readonly selectedModels?: SelectedModels;
    readonly selectedModel?: SelectedModelType;
    readonly architectureMode: ArchitectureModeType;
    readonly refreshId: string;
    readonly config: ConfigObjects;
    setModel: (model: ModelType) => void;
}

const mapStateToProps = (state: {config: ConfigObjects, refreshId: string, architectureMode: ArchitectureModeType, selectedModels: SelectedModels}) => {
    return {
        architectureMode: state.architectureMode,
        selectedModels: state.selectedModels,
        refreshId: state.refreshId,
        config: state.config,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<ModelType, unknown, AnyAction>) => {
    return {
        setModel: (model: ModelType) => dispatch(setModel(model)),
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


const ArchitectureSelector = (props: PropsType) => {
    const isFirstLoadArchitecture = useRef(true);
    const [currentArchitecture, setCurrentArchitecture] = useState<SelectedModelType>();

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
        const selectedHost: string = props.config?.backend?.host ?? defaults.HOST_URL;
        return fetch(`http${selectedHost.startsWith('localhost') ? '' : 's'}://${selectedHost}/`)
            .then(response => response.json())
            .then((data: object) => {
                const keys = Object.keys(data);
                const selectData = keys.map(key => {
                    return {
                        value: key,
                        label: data[key]
                    }
                });
                const firstSelectData = selectData?.[0] ?? {
                    value: undefined,
                    label: undefined,
                };
                setCurrentArchitecture(firstSelectData);
                props.setModel({
                    value: firstSelectData,
                    target: props.isArchitectureA ? 'a' : 'b'
                });
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
