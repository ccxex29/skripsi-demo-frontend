import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {SelectedModels} from '../interfaces/Model';
import {Prediction} from '../interfaces/Prediction';

interface ReducerActions {
    type: string;
    payload: object|string|null;
}

interface StateDataType {
    modelList: object,
    selectedModels: SelectedModels,
    predictions: {
        prediction_a: Prediction,
        prediction_b: Prediction,
    },
    face_detection: {
        position: {
            x?: number,
            y?: number,
            w?: number,
            h?: number,
        }
    }
}

const initialState: StateDataType = {
    modelList: {},
    selectedModels: {
        model_a: undefined,
        model_b: undefined
    },
    predictions: {
        prediction_a: {
            canonicalName: undefined,
            confidence: undefined,
            result: undefined
        },
        prediction_b: {
            canonicalName: undefined,
            confidence: undefined,
            result: undefined,
        }
    },
    face_detection: {
        position: {
            x: undefined,
            y: undefined,
            w: undefined,
            h: undefined
        }
    }
};

const reducer = (state: any = initialState, action: ReducerActions) => {
    switch (action.type) {
        case 'SET_MODEL_A':
            return {
                ...state,
                selectedModels: {
                    ...state.selectedModels,
                    model_a: action.payload
                },
            };
        case 'SET_MODEL_B':
            return {
                ...state,
                selectedModels: {
                    ...state.selectedModels,
                    model_b: action.payload
                },
            };
        case 'SET_PREDICTION_A':
            return {
                ...state,
                predictions: {
                    ...state.predictions,
                    prediction_a: action.payload
                }
            }
        case 'SET_PREDICTION_B':
            return {
                ...state,
                predictions: {
                    ...state.predictions,
                    prediction_b: action.payload
                }
            }
        case 'SET_FACE_DETECTION_POSITION':
            return {
                ...state,
                face_detection: {
                    position: action.payload
                }
            }
        default:
            return state;
    }
}
const store = createStore(reducer, applyMiddleware(thunkMiddleware));

export {store};
