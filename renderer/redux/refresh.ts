import {randomUUID} from 'crypto';

const triggerRefresh = () => {
    return {
        type: 'TRIGGER_REFRESH',
        payload: randomUUID()
    }
};

export {triggerRefresh};
