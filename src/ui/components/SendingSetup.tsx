import React, {
    ChangeEvent,
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import produce from 'immer';
import { v4 as uuid } from 'uuid';
import {
    Button,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form as DefaultForm,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Spinner,
    UncontrolledDropdown,
    UncontrolledTooltip,
} from 'reactstrap';
import styled from 'styled-components';
import validator from 'validator';

import { Status } from '@/server/email-delivery/email-delivery.entity';
import type { DeliveryResponse, FetchDelivery } from '@/ui/components/TabsRoot';
import useRequest, { State as RequestState } from '@/ui/hooks/useRequest';
import { usePrev } from '@/ui/hooks/usePrev';
import BulkAddRecipientsModal from '@/ui/components/BulkAddRecipientsModal';

interface Props {
    delivery: RequestState<DeliveryResponse>;
    fetchDelivery: FetchDelivery;
    switchTab: (to: 'setup' | 'progress') => void;
}

const SendingSetup: React.FC<Props> = ({
    delivery,
    fetchDelivery,
    switchTab,
}) => {
    const [alias, setAlias] = useState('');

    const [subject, setSubjectRaw] = useState('');

    const setSubject = useCallback(
        ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setSubjectRaw(value);
        },
        [setSubjectRaw],
    );

    const [content, setContentRaw] = useState('');
    const setContent = useCallback(
        ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
            setContentRaw(value);
        },
        [setContentRaw],
    );

    const [deliveryIntervalFrom, setDeliveryIntervalFromRaw] = useState(5);
    const [deliveryIntervalTo, setDeliveryIntervalToRaw] = useState(10);
    const setDeliveryIntervalFrom = useCallback(
        ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            const numValue = +value;
            setDeliveryIntervalFromRaw(numValue);
            if (numValue > deliveryIntervalTo) {
                setDeliveryIntervalToRaw(numValue);
            }
        },
        [
            setDeliveryIntervalFromRaw,
            deliveryIntervalTo,
            setDeliveryIntervalToRaw,
        ],
    );
    const setDeliveryIntervalTo = useCallback(
        ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            const numValue = +value;
            setDeliveryIntervalToRaw(numValue);
            if (numValue < deliveryIntervalFrom) {
                setDeliveryIntervalFromRaw(numValue);
            }
        },
        [
            setDeliveryIntervalToRaw,
            deliveryIntervalFrom,
            setDeliveryIntervalFromRaw,
        ],
    );

    const [recipientsList, setRecipientsList] = useState<
        { id: string; value: string }[]
    >([]);

    const addRecipient = useCallback(() => {
        setRecipientsList((list) =>
            produce(list, (draftList) => {
                draftList.push({
                    id: uuid(),
                    value: '',
                });
            }),
        );
    }, [setRecipientsList]);

    const removeRecipient = useCallback(
        (i: number) => {
            setRecipientsList((list) =>
                produce(list, (draftList) => {
                    draftList.splice(i, 1);
                }),
            );
        },
        [setRecipientsList],
    );

    const addBulkRecipients = useCallback(
        (recipients: string[]) => {
            setRecipientsList((list) =>
                produce(list, (draftList) => {
                    draftList.push(
                        ...recipients.map((r) => ({
                            id: uuid(),
                            value: r,
                        })),
                    );
                }),
            );
        },
        [setRecipientsList],
    );

    const latestRecipient = useRef<Input<HTMLInputElement> | null>(null);
    const handleRecipientChange = useCallback(
        (i: number) => ({
            target: { value },
        }: ChangeEvent<HTMLInputElement>) => {
            setRecipientsList((list) =>
                produce(list, (draftList) => {
                    draftList[i].value = value;
                }),
            );
        },
        [setRecipientsList],
    );

    const [
        isBulkRecipientsModalOpened,
        setBulkRecipientsModalOpened,
    ] = useState(false);
    const toggleBulkRecipientsModalOpened = useCallback(() => {
        setBulkRecipientsModalOpened((f) => !f);
    }, [setBulkRecipientsModalOpened]);

    const submitBtnRef = useRef<HTMLButtonElement>(null);

    const { state: aliases, perform: fetchAliases } = useRequest<string[]>({
        method: 'get',
        url: '/email-delivery/aliases',
    });
    const prevAliasesStatus = usePrev(aliases.status);

    const {
        state: createEmailDeliveryResponse,
        perform: createEmailDelivery,
    } = useRequest({
        method: 'post',
        url: '/email-delivery',
    });
    const prevCreateEmailDeliveryResponseStatus = usePrev(
        createEmailDeliveryResponse.status,
    );

    const formValidationErrors: string[] = useMemo(() => {
        const errors: string[] = [];

        if (delivery.status === 'REJECTED') {
            errors.push('Unable to fetch current email delivery info');
            return errors;
        }

        if (delivery.data?.delivery?.status === Status.IN_PROGRESS) {
            errors.push('Email delivery is already in progress');
            return errors;
        }

        if (!alias) {
            errors.push(`"From" is not selected`);
        }

        if (!subject.trim()) {
            errors.push(`Subject is empty`);
        }

        if (!content.trim()) {
            errors.push(`Text is empty`);
        }

        if (deliveryIntervalFrom < 1) {
            errors.push(`Delivery interval lower bound must be at least 1`);
        }

        if (deliveryIntervalTo < 1) {
            errors.push(`Delivery interval upper bound must be at least 1`);
        }

        if (!recipientsList.length) {
            errors.push(`Recipient list is empty`);
        }

        recipientsList.forEach((r, i) => {
            if (!validator.isEmail(r.value)) {
                errors.push(`Recepient #${i + 1} is not a valid email`);
            }
        });

        return errors;
    }, [
        delivery,
        alias,
        subject,
        content,
        deliveryIntervalFrom,
        deliveryIntervalTo,
        recipientsList,
    ]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (formValidationErrors.length) {
            return;
        }
        createEmailDelivery({
            from: alias,
            to: recipientsList.map((r) => r.value),
            subject,
            text: content,
            deliveryInterval: {
                from: deliveryIntervalFrom,
                to: deliveryIntervalTo,
            },
        });
    };

    useEffect(() => {
        if (
            aliases.status === 'FULFILLED' &&
            aliases.status !== prevAliasesStatus
        ) {
            setAlias(aliases.data[0]);
        }
    }, [aliases, prevAliasesStatus]);

    useEffect(() => {
        if (
            createEmailDeliveryResponse.status === 'FULFILLED' &&
            createEmailDeliveryResponse.status !==
                prevCreateEmailDeliveryResponseStatus
        ) {
            fetchDelivery(undefined, {
                removeOldData: true,
            });
            switchTab('progress');
        }
    }, [
        createEmailDeliveryResponse,
        prevCreateEmailDeliveryResponseStatus,
        fetchDelivery,
        switchTab,
    ]);

    useEffect(() => {
        fetchAliases();
    }, [fetchAliases]);

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup row>
                <Label sm={2}>From</Label>
                <Col sm={10}>
                    {aliases.status === 'FULFILLED' ? (
                        <UncontrolledDropdown>
                            <DropdownToggle caret color='info'>
                                {alias}
                            </DropdownToggle>
                            <DropdownMenu>
                                {aliases.data.map((curAlias) => (
                                    <DropdownItem
                                        key={curAlias}
                                        onClick={() => setAlias(curAlias)}
                                    >
                                        {curAlias}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    ) : (
                        <Spinner color='info' />
                    )}
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label sm={2}>Subject</Label>
                <Col sm={10}>
                    <Input value={subject} onChange={setSubject} />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label sm={2}>Content</Label>
                <Col sm={10}>
                    <textarea
                        className='form-control'
                        value={content}
                        onChange={setContent}
                        rows={10}
                    />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label sm={2}>Delivery interval</Label>
                <Col sm={4}>
                    <InputGroup>
                        <Input
                            type='number'
                            min={1}
                            value={deliveryIntervalFrom}
                            onChange={setDeliveryIntervalFrom}
                        />
                        <InputGroupAddon addonType='append'>
                            <InputGroupText>
                                {deliveryIntervalFrom > 1 ? (
                                    <>minutes</>
                                ) : (
                                    <>minute</>
                                )}
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </Col>
                <Label sm={2} className='text-center'>
                    to
                </Label>
                <Col sm={4}>
                    <InputGroup>
                        <Input
                            type='number'
                            min={1}
                            value={deliveryIntervalTo}
                            onChange={setDeliveryIntervalTo}
                        />
                        <InputGroupAddon addonType='append'>
                            <InputGroupText>
                                {deliveryIntervalTo > 1 ? (
                                    <>minutes</>
                                ) : (
                                    <>minute</>
                                )}
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </Col>
            </FormGroup>
            {!!recipientsList.length && (
                <FormGroup row>
                    <Label sm={2}>Recipients ({recipientsList.length})</Label>
                    <Col sm={10}>
                        {recipientsList.map((recipient, i) => (
                            <FormGroup key={recipient.id}>
                                <InputGroup>
                                    <InputGroupAddon addonType='prepend'>
                                        <InputGroupText>{i + 1}</InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        value={recipient.value}
                                        onChange={handleRecipientChange(i)}
                                        ref={latestRecipient}
                                    />
                                    <InputGroupAddon addonType='append'>
                                        <Button
                                            color='danger'
                                            onClick={() => removeRecipient(i)}
                                        >
                                            Remove
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormGroup>
                        ))}
                    </Col>
                </FormGroup>
            )}
            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    <Button
                        color='info'
                        className='mr-3'
                        onClick={addRecipient}
                    >
                        Add recipient
                    </Button>
                    <Button
                        color='info'
                        onClick={toggleBulkRecipientsModalOpened}
                    >
                        Bulk add recipients
                    </Button>
                    <Button
                        className='float-right'
                        color='danger'
                        onClick={() => setRecipientsList([])}
                    >
                        Remove all recipients
                    </Button>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    <Button
                        type='submit'
                        color='success'
                        className='form-control'
                        innerRef={submitBtnRef}
                        disabled={
                            createEmailDeliveryResponse.status === 'IN_PROGRESS'
                        }
                    >
                        {createEmailDeliveryResponse.status ===
                        'IN_PROGRESS' ? (
                            <Spinner size='sm' />
                        ) : (
                            <>Start</>
                        )}
                    </Button>
                    {!!formValidationErrors.length && submitBtnRef.current && (
                        <ValidationErrorTooltip
                            target={submitBtnRef.current}
                            trigger='hover'
                            placement='top'
                            autohide={false}
                        >
                            <ul>
                                {formValidationErrors.reduce<React.ReactNode>(
                                    (res, e) =>
                                        res ? (
                                            <>
                                                {res}
                                                <li>{e}</li>
                                            </>
                                        ) : (
                                            <li>{e}</li>
                                        ),
                                    null,
                                )}
                            </ul>
                        </ValidationErrorTooltip>
                    )}
                </Col>
            </FormGroup>

            <BulkAddRecipientsModal
                isOpened={isBulkRecipientsModalOpened}
                toggle={toggleBulkRecipientsModalOpened}
                onDone={addBulkRecipients}
            />
        </Form>
    );
};

const Form = styled(DefaultForm)`
    margin-bottom: 60px;
`;

const ValidationErrorTooltip = styled(UncontrolledTooltip)`
    .tooltip {
        white-space: nowrap;
    }

    .tooltip-inner {
        text-align: left;
        max-width: none;
    }

    ul {
        padding-inline-start: 0;
        list-style-type: none;
    }
`;

export default SendingSetup;
