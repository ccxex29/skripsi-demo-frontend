import React from 'react';
import styles from '../public/styles/Header.module.sass';
import ArchitectureSelector from './ArchitectureSelector';
import HeaderSeparator from './HeaderSeparator';
import {SelectedModels} from '../interfaces/Model';
import {connect} from 'react-redux';

interface HeaderProps {
    readonly selectedModels: SelectedModels;
}

const mapStateToProps = (state: {selectedModels: SelectedModels}) => {
    return {
        selectedModels: state.selectedModels,
    }
}

const Header = (props: HeaderProps) => {
    return (
        <div className={styles.wrapper}>
            <ArchitectureSelector alignment={'left'} isArchitectureA={true} selectedModel={props.selectedModels.model_a} />
            <HeaderSeparator />
            <ArchitectureSelector alignment={'right'} isArchitectureB={true} selectedModel={props.selectedModels.model_b} />
        </div>
    );
};

export default connect(mapStateToProps, null)(Header);
