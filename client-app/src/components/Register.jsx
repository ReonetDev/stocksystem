import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Stack, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        registrationCode: '',
        stock: false,
        sim: false,
        prv: false,
        manage: false,
        system: false,
        role: 'User',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5260/api/users/register', formData);
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/');
            }, 500); // Redirect after .5 seconds to allow toast to be seen
        } catch (error) {
            console.error('Registration failed', error);
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = Object.values(formData).every(field => {
        // Exclude boolean fields (modules) from the empty check
        if (typeof field === 'boolean') {
            return true;
        }
        return field.trim() !== '';
    });

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <div className="mb-3">
                        <Link to="/" className="d-flex align-items-center">
                            <FaArrowLeft className="me-2" /> Back
                        </Link>
                    </div>
                    <Stack gap={3} className="align-items-center">
                        <h2>Register New User</h2>
                        <Form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="firstName" placeholder="First Name" onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="lastName" placeholder="Last Name" onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="email" type="email" placeholder="Email" onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="password" type="password" placeholder="Password" onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Control name="registrationCode" type="text" placeholder="Registration Code" onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={!isFormValid || loading} className="w-50">
                                {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
                            </Button>
                        </Form>
                    </Stack>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;