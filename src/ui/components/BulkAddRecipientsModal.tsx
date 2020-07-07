import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import React, { ChangeEvent, useCallback, useState } from 'react';

interface Props {
    isOpened: boolean;
    toggle: () => void;
    onDone: (recipients: string[]) => void;
}

const BulkAddRecipientsModal: React.FC<Props> = ({
    isOpened,
    toggle,
    onDone,
}) => {
    const [recipients, setRecipientsRaw] = useState('');
    const setRecipients = useCallback(
        ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
            setRecipientsRaw(value);
        },
        [setRecipientsRaw],
    );

    const handleDone = useCallback(() => {
        onDone(recipients.trim().split(/(?:\s|\n)+/g));
        toggle();
        setRecipientsRaw('');
    }, [onDone, recipients, toggle]);

    return (
        <Modal isOpen={isOpened} toggle={toggle}>
            <ModalHeader>Bulk add recipients</ModalHeader>
            <ModalBody>
                <textarea
                    className='form-control'
                    placeholder='Enter or paste emails separated by whitespaces, tabs or new lines'
                    rows={10}
                    value={recipients}
                    onChange={setRecipients}
                />
            </ModalBody>
            <ModalFooter>
                <Button color='secondary' onClick={toggle}>
                    Cancel
                </Button>
                <Button color='info' onClick={handleDone}>
                    Done
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default BulkAddRecipientsModal;
