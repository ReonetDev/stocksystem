import React, { useState } from 'react';
import { Container, Form, Button, Spinner, Card } from 'react-bootstrap';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForcePasswordChange = () => {
    const [oldPassword, setOldPassword] = useState('Password');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword !== confirmNewPassword) {
            toast.error('New password and confirmation do not match.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5260/api/users/change-password', {
                currentPassword: oldPassword,
                newPassword,
                confirmNewPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Password updated successfully!');
            // Redirect to login page after successful password change
            navigate('/');
        } catch (error) {
            console.error('Password change failed:', error);
            toast.error(error.response?.data || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const isButtonEnabled = newPassword !== '' && newPassword === confirmNewPassword;

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Update Your Password</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="oldPassword">
                        <Form.Label>Old Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={oldPassword}
                            readOnly
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="confirmNewPassword">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100" disabled={!isButtonEnabled || loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Change Password'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default ForcePasswordChange;
