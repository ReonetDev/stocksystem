import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateMobileDevice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        type: '',
        serialNumber: '',
        imei: '',
        imei2: '',
        status: '',
        allocation: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMobileDevice = async () => {
            try {
                const response = await axios.get(`http://localhost:5260/api/mobiledevices/${id}`);
                setFormData(response.data);
            } catch (error) {
                toast.error('Failed to fetch mobile device data');
            } finally {
                setLoading(false);
            }
        };
        fetchMobileDevice();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5260/api/mobiledevices/${id}`, formData);
            toast.success('Mobile Device updated successfully!', { autoClose: 500 });
            navigate('/mobile-devices');
        } catch (error) {
            toast.error('Failed to update mobile device. Please try again.', { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={6} className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2>Update Mobile Device</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="make">
                            <Form.Label>Make</Form.Label>
                            <Form.Control type="text" name="make" value={formData.make} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="model">
                            <Form.Label>Model</Form.Label>
                            <Form.Control type="text" name="model" value={formData.model} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="type">
                            <Form.Label>Type</Form.Label>
                            <Form.Control type="text" name="type" value={formData.type} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="serialNumber">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="imei">
                            <Form.Label>IMEI</Form.Label>
                            <Form.Control type="text" name="imei" value={formData.imei} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="imei2">
                            <Form.Label>IMEI 2</Form.Label>
                            <Form.Control type="text" name="imei2" value={formData.imei2} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="status">
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                                <option value="STOCK">STOCK</option>
                                <option value="ALLOCATED">ALLOCATED</option>
                                <option value="DAMAGED">DAMAGED</option>
                                <option value="STOLEN">STOLEN</option>
                                <option value="UNKNOWN">UNKNOWN</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="allocation">
                            <Form.Label>Allocation</Form.Label>
                            <Form.Control type="text" name="allocation" value={formData.allocation} onChange={handleChange} required />
                        </Form.Group>
                        <Row className="mt-3">
                            <Col className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" disabled={loading}>Update Mobile Device</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default UpdateMobileDevice;
