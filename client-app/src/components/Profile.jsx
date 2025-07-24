import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Stack, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../axiosConfig';

const Profile = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5260/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user profile', error);
                toast.error('Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const handleUserChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Validate password match dynamically
        if (name === 'newPassword' || name === 'confirmNewPassword') {
            if (name === 'newPassword') {
                setPasswordsMatch(value === passwordData.confirmNewPassword);
            } else {
                setPasswordsMatch(passwordData.newPassword === value);
            }
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5260/api/users/profile', userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordsMatch) {
            toast.error('New password and confirm new password do not match.', { autoClose: 500 });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5260/api/users/change-password', passwordData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Password changed successfully!', { autoClose: 500 });
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear form
        } catch (error) {
            console.error('Failed to change password', error);
            const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
            toast.error(errorMessage, { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    const isPasswordFormValid = passwordData.currentPassword.trim() !== '' &&
                                passwordData.newPassword.trim() !== '' &&
                                passwordData.confirmNewPassword.trim() !== '' &&
                                passwordsMatch;

    return (
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <Stack gap={3} className="align-items-center">
                        <h4>User Profile</h4>
                        {loading && <Spinner animation="border" />}
                        <Form onSubmit={handleProfileSubmit} className="w-100 d-flex flex-column align-items-center">
                            <h4>Update Profile Information</h4>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="firstName" placeholder="First Name" value={userData.firstName} onChange={handleUserChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="lastName" placeholder="Last Name" value={userData.lastName} onChange={handleUserChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="email" type="email" placeholder="Email" value={userData.email} onChange={handleUserChange} style={{ minWidth: '250px' }} disabled />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={loading} className="w-50">
                                {loading ? <Spinner animation="border" size="sm" /> : 'Update Profile'}
                            </Button>
                        </Form>

                        <Form onSubmit={handlePasswordSubmit} className="w-100 d-flex flex-column align-items-center mt-5">
                            <h4>Change Password</h4>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="currentPassword" type="password" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="newPassword" type="password" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control
                                    name="confirmNewPassword"
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    style={{ minWidth: '250px' }}
                                    isInvalid={!passwordsMatch && passwordData.confirmNewPassword.trim() !== ''}
                                />
                                {!passwordsMatch && passwordData.confirmNewPassword.trim() !== '' && (
                                    <Form.Control.Feedback type="invalid">
                                        Passwords do not match.
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                            <Button variant={isPasswordFormValid ? "success" : "primary"} type="submit" disabled={!isPasswordFormValid || loading} className="w-50">
                                {loading ? <Spinner animation="border" size="sm" /> : 'Change Password'}
                            </Button>
                        </Form>
                    </Stack>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;