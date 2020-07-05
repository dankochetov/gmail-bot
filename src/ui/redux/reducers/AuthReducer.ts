import {
    createActionCreators,
    createReducerFunction,
    ImmerReducer,
} from 'immer-reducer';
import { castDraft } from 'immer';

type BasicProfile = gapi.auth2.BasicProfile;

export interface State {
    fetched: boolean;
    user?: BasicProfile;
}

const initialState: State = {
    fetched: false,
};

class AuthReducer extends ImmerReducer<State> {
    setUser({ user }: { user?: BasicProfile }) {
        this.draftState.fetched = true;
        this.draftState.user = castDraft(user);
    }
}

export const reducer = createReducerFunction(AuthReducer, initialState);
export const actions = createActionCreators(AuthReducer);
