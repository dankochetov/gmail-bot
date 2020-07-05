import React, { useEffect, useMemo, useRef } from 'react';
import { Progress, Spinner, Table as DefaultTable } from 'reactstrap';
import styled from 'styled-components';
import moment from 'moment';

import { Status } from '@/server/email-delivery/email-delivery.entity';
import type { DeliveryResponse } from '@/ui/components/TabsRoot';
import type { State as RequestState } from '@/ui/hooks/useRequest';

interface Props {
    delivery: RequestState<DeliveryResponse>;
    fetchDelivery: () => void;
}

const SendingProgress: React.FC<Props> = ({ delivery, fetchDelivery }) => {
    const refreshDeliveryInterval = useRef<ReturnType<typeof setInterval>>();

    const deliveredCount = useMemo(() => {
        return (
            delivery.data?.delivery?.recipients.filter((r) => !!r.delivered_at)
                .length ?? 0
        );
    }, [delivery]);

    useEffect(() => {
        fetchDelivery();

        refreshDeliveryInterval.current = setInterval(fetchDelivery, 1000 * 5);
        return () => {
            if (refreshDeliveryInterval.current) {
                clearInterval(refreshDeliveryInterval.current);
            }
        };
    }, [fetchDelivery]);

    if (
        !delivery.data ||
        (delivery.status === 'PENDING' && !delivery.data.delivery)
    ) {
        return <Spinner />;
    }

    if (!delivery.data.delivery) {
        return <h6>Delivery hasn&apos;t been scheduled yet.</h6>;
    }

    return (
        <>
            <div className='text-center'>
                {deliveredCount} of {delivery.data.delivery.recipients.length}
            </div>
            <Progress
                animated={delivery.data.delivery.status === Status.IN_PROGRESS}
                color={(() => {
                    switch (delivery.data.delivery.status) {
                        case Status.IN_PROGRESS:
                            return 'primary';
                        case Status.COMPLETED:
                            return 'success';
                        case Status.CANCELLED:
                            return 'danger';
                    }
                })()}
                value={deliveredCount}
                max={delivery.data.delivery.recipients.length}
            >
                {Math.floor(
                    (deliveredCount /
                        delivery.data.delivery.recipients.length) *
                        100,
                )}
                %
            </Progress>
            <Table size='sm' striped bordered hover>
                <thead>
                    <tr>
                        <td>#</td>
                        <td>Email</td>
                        <td>Status</td>
                        <td>Sent at</td>
                    </tr>
                </thead>
                <tbody>
                    {delivery.data.delivery.recipients
                        .slice()
                        .sort((a, b) => a.index - b.index)
                        .map((r) => (
                            <tr key={r.email}>
                                <td>{r.index + 1}</td>
                                <td>{r.email}</td>
                                <td>
                                    {r.delivered_at ? (
                                        <p className='text-success'>
                                            Delivered
                                        </p>
                                    ) : (
                                        <p className='text-muted'>Pending</p>
                                    )}
                                </td>
                                <td>
                                    {r.delivered_at
                                        ? moment(r.delivered_at)
                                              .toDate()
                                              .toLocaleString()
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </>
    );
};

const Table = styled(DefaultTable)`
    margin-top: 15px;
`;

export default SendingProgress;
