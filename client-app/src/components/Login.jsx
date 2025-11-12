import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Form, Button, Container, Row, Col, Stack, Spinner, Alert, ProgressBar} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import logo from '../assets/reologo.gif'; // Using reoicon.png as per request
import { toast } from 'react-toastify';

const Login = () => {
    
    //Automatic Update Params
    const [status, setStatus] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    //Login Params
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [theme, setTheme] = useState('light'); // Add theme state
    const [appVersion, setAppVersion] = useState('');
    const [appPlatform, setPlatFrom] = useState('');
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

        // Set up IPC listeners for update status
        const removeStatusListener = window.ipcRenderer.on('update-status', (message) => {
            setStatus(message);
            if (message === 'Update available.') {
                setIsDownloading(true);
            }
            if (message.includes('Update downloaded') || message.includes('Error')) {
                setIsDownloading(false);
            }
        });

        const removeProgressListener = window.ipcRenderer.on('download-progress', (progress) => {
            setDownloadProgress(progress);
        });

        // Automatically check for updates when component mounts (skip on macOS)
        if (window.ipcRenderer) {
            window.ipcRenderer.invoke('get-platform').then(platform => {
                if (platform !== 'darwin') {
                    setStatus('Checking for updates...');
                    window.ipcRenderer.send('check-for-updates');
                }
                setPlatFrom(platform);
            });
        }

        return () => {
            removeStatusListener();
            removeProgressListener();
        };
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
            toast.error(errorMessage , { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRestart = () => {
        window.ipcRenderer.send('restart-app');
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <Stack gap={3} className="align-items-center">
                        <img src={logo} alt="Reonet Logo" style={{ maxWidth: '250px', margin: '0 auto',marginBottom:15 }} />
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
                                {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Login'}
                            </Button>
                        </Form>
                    </Stack>
                    <div className="mt-5 pb-5 text-center">
                        <Link to="/register" style={{ fontSize: '0.8rem' }}>Register</Link>
                    </div>
                    <div className="mt-5 text-center" style={{ color: '#dde638ff', fontSize: '0.8rem', fontWeight:900, fontStyle:'italic' }}>
                        Version: {appVersion}
                        <br></br>
                        Platform: { appPlatform }
                    </div>
                    <div className="mt-5 text-center">
                        {isDownloading && <ProgressBar now={downloadProgress} label={`${downloadProgress.toFixed(2)}%`} className="mb-3" />}
                    {status && (
                        <Alert style={{ fontSize: '0.8rem' , background: 'transparent' , border: 'none'}} variant={status.includes('Error') ? 'danger' : 'success'}>
                            {status}
                            {status.includes('Restart now?') && (
                                <Button onClick={handleRestart} variant="primary" size="sm" className="ms-2">Restart</Button>
                            )}
                        </Alert>
                    )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;