import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {SelectedModels} from '../interfaces/Model';
import {Prediction} from '../interfaces/Prediction';
import {ArchitectureModeType} from '../interfaces/ArchitectureMode';
import {IOptions} from 'nconf';
import {randomUUID} from 'crypto';

interface ReducerActions {
    type: string;
    payload: object|string|null;
}

interface StateDataType {
    modelList: object;
    architectureMode: ArchitectureModeType;
    selectedModels: SelectedModels;
    predictions: {
        prediction_a: Prediction,
        prediction_b: Prediction,
    };
    face_detection: {
        position: {
            x?: number,
            y?: number,
            w?: number,
            h?: number,
        }
    };
    profiles: [string, string][];
    selected_profile?: number;
    config: IOptions;
    refreshId: string;
}

const initialState: StateDataType = {
    modelList: {},
    architectureMode: 'single',
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
    },
    profiles: [],
    selected_profile: undefined,
    config: {},
    refreshId: randomUUID(),
};

const reducer = (state = initialState, action: ReducerActions) => {
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
        case 'SET_ARCHITECTURE_MODE_COMPARE':
            return {
                ...state,
                architectureMode: 'compare',
            }
        case 'SET_ARCHITECTURE_MODE_SINGLE':
            return {
                ...state,
                architectureMode: 'single',
            }
        case 'FLIP_ARCHITECTURE_MODE':
            return {
                ...state,
                architectureMode: state.architectureMode === 'single' ? 'compare' : 'single',
            }
        case 'SET_PROFILE_LIST':
            return {
                ...state,
                profiles: action.payload,
            }
        case 'SET_PROFILE':
            if (action.payload === undefined) {
                return state;
            }
            return {
                ...state,
                selected_profile: action.payload,
            }
        case 'SET_GLOBAL_CONFIG':
            if (typeof action.payload !== 'object') {
                return state;
            }
            return {
                ...state,
                config: action.payload,
            }
        case 'SET_CONFIG':
            if (typeof action.payload !== 'object') {
                return state;
            }
            return {
                ...state,
                config: {
                    ...state.config,
                    ...action.payload
                }
            }
        case 'TRIGGER_REFRESH':
            return {
                ...state,
                refreshId: action.payload
            }
        default:
            return state;
    }
}
const store = createStore(reducer, applyMiddleware(thunkMiddleware));

export {store};
