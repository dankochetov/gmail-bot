import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import {
    Nav,
    NavItem,
    NavLink as DefaultNavLink,
    TabContent as DefaultTabContent,
    TabPane,
} from 'reactstrap';
import { C } from 'ts-toolbelt';

import EmailDelivery from '@/server/email-delivery/email-delivery.entity';
import useRequest from '@/ui/hooks/useRequest';
import SendingSetup from './SendingSetup';
import SendingProgress from './SendingProgress';

export interface DeliveryResponse {
    delivery:
        | (Omit<EmailDelivery, 'recipients'> & {
              recipients: C.PromiseOf<EmailDelivery['recipients']>;
          })
        | null;
}

export type FetchDelivery = ReturnType<typeof useRequest>['perform'];

const TabsRoot: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'setup' | 'progress'>('setup');

    const { state: delivery, perform: fetchDelivery } = useRequest<
        DeliveryResponse
    >({
        method: 'get',
        url: '/email-delivery/latest',
    });

    useEffect(() => {
        fetchDelivery();
    }, [fetchDelivery]);

    return (
        <>
            <Nav tabs>
                <NavItem>
                    <NavLink
                        className={classNames({
                            active: activeTab === 'setup',
                        })}
                        onClick={() => setActiveTab('setup')}
                    >
                        Setup
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classNames({
                            active: activeTab === 'progress',
                        })}
                        onClick={() => setActiveTab('progress')}
                    >
                        Progress
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId='setup'>
                    <SendingSetup
                        delivery={delivery}
                        fetchDelivery={fetchDelivery}
                        switchTab={setActiveTab}
                    />
                </TabPane>
                <TabPane tabId='progress'>
                    <SendingProgress
                        delivery={delivery}
                        fetchDelivery={fetchDelivery}
                    />
                </TabPane>
            </TabContent>
        </>
    );
};

const NavLink = styled(DefaultNavLink)`
    user-select: none;

    &:not(.active) {
        cursor: pointer;
    }
`;

const TabContent = styled(DefaultTabContent)`
    margin-top: 15px;
`;

export default TabsRoot;
