import React, { useCallback, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button } from 'reactstrap';

import { SCOPE } from '@/ui/AuthGuard';
import { actions as authActions } from '../redux/reducers/AuthReducer';
import useRequest from '../hooks/useRequest';
import { usePrev } from '../hooks/usePrev';

type GoogleUser = gapi.auth2.GoogleUser;

interface Props extends ConnectedProps<typeof connector> {
    onIdTokenSet: () => void;
}

const LoginButton: React.FC<Props> = ({ onIdTokenSet, setUser }) => {
    const ignoredHandleLoggedIn = useCallback(
        (user: GoogleUser) => {
            setUser({ user: user.getBasicProfile() });
        },
        [setUser],
    );

    const {
        state: sendOfflineCodeResponse,
        perform: sendOfflineCode,
    } = useRequest<{ idToken: string }>({
        method: 'post',
        url: '/user/grant-offline-access',
    });
    const prevSendOfflineCodeResponseStatus = usePrev(
        sendOfflineCodeResponse.status,
    );

    const handleLoginBtnClick = useCallback(() => {
        (async () => {
            const res = await gapi.auth2.getAuthInstance().grantOfflineAccess({
                scope: SCOPE,
                prompt: 'consent',
            });
            sendOfflineCode({
                code: res.code,
            });
        })().catch((e) => {
            console.error(e);
        });
    }, [sendOfflineCode]);

    useEffect(() => {
        if (
            sendOfflineCodeResponse.status === 'FULFILLED' &&
            sendOfflineCodeResponse.status !== prevSendOfflineCodeResponseStatus
        ) {
            localStorage.setItem(
                'idToken',
                sendOfflineCodeResponse.data.idToken,
            );
            onIdTokenSet();
        }
    }, [
        onIdTokenSet,
        prevSendOfflineCodeResponseStatus,
        sendOfflineCodeResponse,
    ]);

    return (
        <Button color='primary' onClick={handleLoginBtnClick}>
            Log in with Google
        </Button>
    );
};

const mapDispatch = {
    ...authActions,
};

const connector = connect(null, mapDispatch);

export default connector(LoginButton);
