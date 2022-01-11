export interface PredictionType extends Prediction {
    target: 'a'|'b',
}

export interface Prediction {
    canonicalName?: string,
    confidence?: number,
    result?: 'drowsy'|'alert',
}
