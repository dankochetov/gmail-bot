import { createSelector } from 'reselect';

import type { RootState } from '../index';

export const selectAuth = (store: RootState) => store.auth;

export const selectUser = createSelector([selectAuth], (auth) => auth.user);
