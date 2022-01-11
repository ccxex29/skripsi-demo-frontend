import {FaceDetectionPosition} from '../interfaces/FaceDetectionPosition';

const setFaceDetectionPosition = (position: FaceDetectionPosition) => {
    return {
        type: 'SET_FACE_DETECTION_POSITION',
        payload: position
    }
};

export {setFaceDetectionPosition};
