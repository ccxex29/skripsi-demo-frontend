import {PredictionType} from '../interfaces/Prediction';

const setPrediction = (prediction: PredictionType) => {
    return {
        type: prediction.target === 'a' ? 'SET_PREDICTION_A' : 'SET_PREDICTION_B',
        payload: {
            canonicalName: prediction.canonicalName,
            confidence: prediction.confidence,
            result: prediction.result
        }
    };
};

export {setPrediction};
