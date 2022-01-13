import {ArchitectureModeType} from '../interfaces/ArchitectureMode';

const setArchitectureMode = (mode: ArchitectureModeType) => {
    return {
        type: mode === 'compare' ? 'SET_ARCHITECTURE_MODE_COMPARE' : 'SET_ARCHITECTURE_MODE_SINGLE',
        payload: null,
    }
};

const flipArchitectureMode = () => {
    return {
        type: 'FLIP_ARCHITECTURE_MODE',
        payload: null,
    }
};

export {setArchitectureMode, flipArchitectureMode};
