import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { actions as authActions } from './redux/reducers/AuthReducer';
import { RootState } from './redux';
import { selectAuth } from './redux/selectors/auth';
import LoginButton from './components/LoginButton';

export const SCOPE =
    'email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly';

const AuthGuard: React.FC<ConnectedProps<typeof connector>> = ({
    auth,
    setUser,
    children,
}) => {
    const [hasIdToken, setHasIdToken] = useState(
        () => !!localStorage.getItem('idToken'),
    );

    const handleSignedInChange = useCallback(
        (isSignedIn: boolean) => {
            const user = gapi.auth2
                .getAuthInstance()
                .currentUser.get()
                .getBasicProfile();
            setUser({ user: isSignedIn ? user : undefined });
        },
        [setUser],
    );

    useEffect(() => {
        gapi.load('client:auth2', () => {
            (async () => {
                await gapi.client.init({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    scope: SCOPE,
                });
                const auth2 = gapi.auth2.init({
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    scope: SCOPE,
                });

                auth2.isSignedIn.listen(handleSignedInChange);

                setUser({ user: auth2.currentUser.get().getBasicProfile() });
            })().catch((e: Error) => {
                console.error(e);
            });
        });
    }, [setUser, handleSignedInChange]);

    if (auth.fetched) {
        if (auth.user && hasIdToken) {
            return <>{children}</>;
        }

        return <LoginButton onIdTokenSet={() => setHasIdToken(true)} />;
    }

    return null;
};

const mapState = (state: RootState) => ({
    auth: selectAuth(state),
});

const mapDispatch = {
    ...authActions,
};

const connector = connect(mapState, mapDispatch);

export default connector(AuthGuard);
