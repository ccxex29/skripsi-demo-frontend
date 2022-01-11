import {ModelType} from '../interfaces/Model';

const setModel = (model: ModelType) => {
    return {
        type: model.target === 'a' ? 'SET_MODEL_A' : 'SET_MODEL_B',
        payload: model.value
    }
}

export {setModel}
