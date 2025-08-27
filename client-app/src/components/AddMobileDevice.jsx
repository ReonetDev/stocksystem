import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';

const AddMobileDevice = () => {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        type: '',
        serialNumber: '',
        imei: '',
        imei2: '',
        status: 'STOCK',
        allocation: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5260/api/mobiledevices', formData);
            toast.success('Mobile Device added successfully!', { autoClose: 500 });
            setFormData({
                make: '',
                model: '',
                type: '',
                serialNumber: '',
                imei: '',
                imei2: '',
                status: '',
                allocation: ''
            });
            navigate('/mobile-devices');
        } catch (error) {
            toast.error('Failed to add mobile device. Please try again.', { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h4 className="mb-2 text-center">Add Mobile Device</h4>
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
                        <Form.Group className='mb-3' controlId="allocation">
                            <Form.Label>Allocation</Form.Label>
                            <Form.Control type="text" name="allocation" value={formData.allocation} onChange={handleChange} required />
                        </Form.Group>
                        <Row className="mt-3">
                            <Col className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Add Mobile Device'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default AddMobileDevice;
