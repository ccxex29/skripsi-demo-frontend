import {IOptions} from 'nconf';

const setConfig = (options: IOptions) => {
    return {
        type: 'SET_GLOBAL_CONFIG',
        payload: options,
    }
}

const setOneConfig = (options: IOptions) => {
    return {
        type: 'SET_CONFIG',
        payload: options,
    }
}

export {setConfig, setOneConfig};
