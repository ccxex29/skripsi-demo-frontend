import React from 'react';
import styles from '../public/styles/ProfileSwitcher.module.sass';
import {Profile, ProfileList} from '../interfaces/Profile';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {setProfile} from '../redux/profile';
import {SelectedModels} from '../interfaces/Model';
import {flipArchitectureMode, setArchitectureMode} from '../redux/architectureMode';

interface ProfileSwitcherProps {
    readonly profiles: ProfileList;
    readonly profile: Profile;
    readonly selectedModels: SelectedModels;
    readonly setProfile: (profile: Profile) => void;
    readonly setArchitectureModeCompare: () => void;
}

const mapStateToProps = (state: {selectedModels: SelectedModels, profiles: ProfileList, selected_profile: Profile}) => {
    return {
        profiles: state.profiles,
        profile: state.selected_profile,
        selectedModels: state.selectedModels,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<Profile, unknown, AnyAction>) => {
    return {
        setProfile: (profile: Profile) => dispatch(setProfile(profile)),
        setArchitectureModeCompare: () => dispatch(setArchitectureMode('compare')),
    }
}

const ProfileSwitcher = (props: ProfileSwitcherProps) => {
    const setProfileHandler = (profileIdx: number) => {
        props.setProfile(profileIdx);
        props.setArchitectureModeCompare();

    }
    const profileButtons = () => {
        const profileButtonRenders: JSX.Element[] = [];
        for (const profileIdx in props.profiles) { // eslint-disable-line @typescript-eslint/no-for-in-array
            const profileIdxCasted = parseInt(profileIdx);
            const doesProfileMatchesSelections = (props.profiles[props.profile]?.[0] === props.selectedModels?.model_a?.value) && (props.profiles[props.profile]?.[1] === props.selectedModels?.model_b?.value)
            profileButtonRenders.push(
                <button key={profileIdx} onClick={() => setProfileHandler(profileIdxCasted)} className={`${styles.button} ${(doesProfileMatchesSelections) ? styles.selectedButton : undefined} `}>
                    {parseInt(profileIdx) + 1}
                </button>
            );
        }
        return profileButtonRenders;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>PROFILE</div>
            {profileButtons()}
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSwitcher);
