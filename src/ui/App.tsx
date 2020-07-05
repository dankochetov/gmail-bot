import React from 'react';
import { Container } from 'reactstrap';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';

import Header from '@/ui/components/Header';
import AuthGuard from '@/ui/AuthGuard';
import TabsRoot from './components/TabsRoot';

interface Props {}

const App: React.FC<Props> = () => {
    return (
        <Root>
            <Header />
            <Content>
                <ContentInner>
                    <AuthGuard>
                        <TabsRoot />
                    </AuthGuard>
                </ContentInner>
            </Content>
        </Root>
    );
};

const Root = styled.div`
    display: flex;
    flex-flow: column nowrap;
    height: 100%;
`;

const Content = styled.div`
    flex: 1;
    overflow-y: auto;
`;

const ContentInner = styled(Container)`
    padding-top: 15px;
`;

export default hot(App);
