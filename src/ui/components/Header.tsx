import React, { useCallback } from 'react';
import {
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarBrand,
    UncontrolledDropdown,
} from 'reactstrap';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '@/ui/redux';
import { selectUser } from '@/ui/redux/selectors/auth';

const Header: React.FC<ConnectedProps<typeof connector>> = ({ user }) => {
    const handleLogout = useCallback(() => {
        localStorage.removeItem('idToken');
        gapi.auth2.getAuthInstance().signOut();
    }, []);

    return (
        <Navbar color='light'>
            <Container>
                <NavbarBrand>Gmail Bot</NavbarBrand>
                {user && (
                    <Nav navbar>
                        <UncontrolledDropdown nav direction='left'>
                            <DropdownToggle nav caret>
                                <img
                                    alt='Profile'
                                    src={user.getImageUrl()}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        margin: '-16px .5em -16px 0',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem header>
                                    {user.getName()}
                                </DropdownItem>
                                <DropdownItem onClick={handleLogout}>
                                    Log out
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Nav>
                )}
            </Container>
        </Navbar>
    );
};

const mapState = (state: RootState) => ({
    user: selectUser(state),
});

const connector = connect(mapState);
export default connector(Header);
