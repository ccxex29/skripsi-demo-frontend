import {Profile, ProfileList} from '../interfaces/Profile';

const setProfiles = (profiles: ProfileList) => {
    return {
        type: 'SET_PROFILE_LIST',
        payload: profiles,
    }
}

const setProfile = (profile: Profile)  => {
    return {
        type: 'SET_PROFILE',
        payload: profile,
    }
}

export {setProfiles, setProfile};
