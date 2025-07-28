import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateDevice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        description: '',
        make: '',
        model: '',
        size: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const response = await axios.get(`http://localhost:5260/api/devices/${id}`);
                setFormData(response.data);
            } catch (error) {
                toast.error('Failed to fetch device data');
            } finally {
                setLoading(false);
            }
        };
        fetchDevice();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5260/api/devices/${id}`, formData);
            toast.success('Device updated successfully!', { autoClose: 500 });
            navigate('/devices');
        } catch (error) {
            toast.error('Failed to update device. Please try again.', { autoClose: 500 });
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
                    <h2>Update Device</h2>
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
                            <Form.Control type="text" name="model" value={formData.model} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="size">
                            <Form.Label>Size</Form.Label>
                            <Form.Control type="text" name="size" value={formData.size} onChange={handleChange} />
                        </Form.Group>
                        <Row className="mt-3">
                            <Col className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" disabled={loading}>Update Device</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default UpdateDevice;
