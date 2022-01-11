import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

type reducerActions = {
    type: string,
    payload: object|string|null,
};

interface StateDataType {
    modelList: object,
    selectedModels: {
        model_a?: string,
        model_b?: string
    },
    predictions: {
        prediction_a: {
            confidence?: number,
            result?: 'drowsy'|'alert',
        },
        prediction_b: {
            confidence?: number,
            result?: 'drowsy'|'alert',
        },
    },
}

const initialState: StateDataType = {
    modelList: {},
    selectedModels: {
        model_a: undefined,
        model_b: undefined
    },
    predictions: {
        prediction_a: {
            confidence: undefined,
            result: undefined
        },
        prediction_b: {
            confidence: undefined,
            result: undefined,
        }
    },
};

const reducer = (state: any = initialState, action: reducerActions) => {
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
        default:
            return state;
    }
}
const store = createStore(reducer, applyMiddleware(thunkMiddleware));

export {store};
