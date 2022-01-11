import React from 'react';
import styles from '../public/styles/Header.module.sass';
import ArchitectureSelector from './ArchitectureSelector';
import HeaderSeparator from './HeaderSeparator';

const Header = () => {
    return (
        <div className={styles.wrapper}>
            <ArchitectureSelector alignment={'left'} isArchitectureA={true} />
            <HeaderSeparator />
            <ArchitectureSelector alignment={'right'} isArchitectureB={true} />
        </div>
    );
};

export default Header;
