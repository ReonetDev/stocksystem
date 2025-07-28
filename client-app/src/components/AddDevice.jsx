import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';

const AddDevice = () => {
    const [formData, setFormData] = useState({
        description: '',
        make: '',
        model: '',
        size: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5260/api/devices', formData);
            toast.success('Device added successfully!' , { autoClose: 500 });
            setFormData({
                description: '',
                make: '',
                model: '',
                size: ''
            });
        } catch (error) {
            toast.error('Failed to add device. Please try again.' , { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h4 className="mb-2 text-center">Add Device</h4>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="make">
                            <Form.Label>Make</Form.Label>
                            <Form.Control type="text" name="make" value={formData.make} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="model">
                            <Form.Label>Model</Form.Label>
                            <Form.Control type="text" name="model" value={formData.model} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId="size">
                            <Form.Label>Size</Form.Label>
                            <Form.Control type="text" name="size" value={formData.size} onChange={handleChange} required />
                        </Form.Group>
                        <Row className="mt-3">
                            <Col className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Add Device'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default AddDevice;
