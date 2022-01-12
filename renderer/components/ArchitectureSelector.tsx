import React, {useEffect, useRef, useState} from 'react';
import AsyncSelect from 'react-select/async';
import styles from '../public/styles/ArchitectureSelector.module.sass';
import {ArchitectureOption, ModelType, SelectedModelType} from '../interfaces/Model';
import {setModel} from '../redux/model';
import {connect} from 'react-redux';

interface PropsType {
    readonly alignment: string;
    readonly isArchitectureA?: boolean;
    readonly isArchitectureB?: boolean;
    readonly selectedModel?: SelectedModelType;
    setModel: (model: ModelType) => void;
}

const mapDispatchToProps = (dispatch) => {
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

    const getArchitectureList = () => {
        return fetch('http://localhost:8889')
            .then(response => response.json())
            .then(data => {
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
        props.setModel({
            value: value,
            target: props.isArchitectureA ? 'a' : 'b'
        });
    };

    return (
        <div id={`sel-arch-${props.alignment}`} className={styles.wrapper} style={{
            alignItems: getFlexAlignment(props.alignment),
        }}>
            <div className={styles.selectLabel}>
                SELECT ARCHITECTURE
            </div>
            <AsyncSelect
                instanceId={`react-select-1`}
                cacheOptions
                className={styles.select}
                onChange={handleChangeSelect}
                value={currentArchitecture}
                loadOptions={getArchitectureList}
                getOptionValue={(option: ArchitectureOption) => option.value}
                getOptionLabel={(option: ArchitectureOption) => option.label}
                defaultOptions
                placeholder={'Select Architecture...'}
                isSearchable={false}
            />
        </div>
    );
};

export default connect(null, mapDispatchToProps)(ArchitectureSelector);
