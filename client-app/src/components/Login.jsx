import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Form, Button, Container, Row, Col, Stack, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import logo from '../assets/reoicon.png'; // Using reoicon.png as per request
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [theme, setTheme] = useState('light'); // Add theme state
    const [appVersion, setAppVersion] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for theme changes from main process
        if (window.ipcRenderer) {
            window.ipcRenderer.on('theme-changed', (event, newTheme) => {
                setTheme(newTheme);
            });
        }

        if (window.ipcRenderer) {
            window.ipcRenderer.invoke('get-app-version').then(version => {
                setAppVersion(version);
            });
        }

        // Load credentials
        if (window.ipcRenderer) {
            window.ipcRenderer.invoke('load-credentials').then(credentials => {
                if (credentials) {
                    setEmail(credentials.email);
                    setPassword(credentials.password);
                    setRememberMe(true);
                }
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5260/api/users/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);

            if (rememberMe && window.ipcRenderer) {
                window.ipcRenderer.send('save-credentials', { email, password });
            } else if (!rememberMe && window.ipcRenderer) {
                window.ipcRenderer.send('clear-credentials');
            }

            toast.success('Login successful! Redirecting...', { autoClose: 500 });
            setTimeout(() => {
                if (response.data.forcePasswordChange) {
                    navigate('/force-password-change');
                } else {
                    navigate('/home');
                }
            }, 500); // Redirect after 1 second to allow toast to be seen
        } catch (error) {
            console.error('Login failed', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage , { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <Stack gap={3} className="align-items-center">
                        <img src={logo} alt="Reonet Logo" style={{ maxWidth: '200px', margin: '0 auto' }} />
                        <Form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
                            <Form.Group className="mb-3" controlId="formBasicEmail" style={{ width: '100%' }}>
                                <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ minWidth: '250px' }} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword" style={{ width: '100%', position: 'relative' }}>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ minWidth: '250px' }}
                                />
                                <span
                                    onClick={togglePasswordVisibility}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: theme === 'dark' ? '#FFFFFF' : '#000000',
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                <Form.Check
                                    type="checkbox"
                                    label="Remember me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={!email || !password}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" disabled={!email || !password || loading} className="w-50">
                                {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
                            </Button>
                        </Form>
                    </Stack>
                    <div className="mt-5 pb-5 text-center">
                        <Link to="/register" style={{ fontSize: '0.8rem' }}>Register</Link>
                    </div>
                    <div className="mt-5 text-center" style={{ color: '#b103fcff', fontSize: '0.8rem' }}>
                        Version: {appVersion}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;