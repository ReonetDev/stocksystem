import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, Button, Container, Row, Col, Stack, Spinner } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';

const UpdateStock = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        supplier: '',
        serialNumber: '',
        description: '',
        make: '',
        model: '',
        status: '',
        note: '',
        size: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5260/api/Suppliers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSuppliers(response.data.$values);
            } catch (error) {
                console.error('Failed to fetch suppliers:', error);
                toast.error('Failed to load suppliers.', { autoClose: 1000 });
            }
        };
        fetchSuppliers();

        const fetchStock = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5260/api/serialstock/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setFormData(response.data);
            } catch (error) {
                console.error('Failed to fetch stock', error);
                toast.error('Failed to load stock data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5260/api/serialstock/${id}`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            toast.success('Stock updated successfully!');
            setTimeout(() => {
                window.location = '/stock';
            }, 2000); // Redirect after 2 seconds to allow toast to be seen
        } catch (error) {
            console.error('Failed to update stock', error);
            const errorMessage = error.response?.data?.message || 'Failed to update stock. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = Object.values(formData).every(field => String(field).trim() !== '');

    return (
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <div className="mb-3">
                        <h2>Update Stock</h2>
                        <Link to="/stock" className="d-flex align-items-center">
                            <FaArrowLeft className="me-2" /> Back to Stock List
                        </Link>
                    </div>
                    <Stack gap={3} className="align-items-center">
                        {loading && <Spinner animation="border" />}
                        <Form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Supplier</Form.Label>
                                <Form.Select name="supplier" value={formData.supplier} onChange={handleChange} style={{ minWidth: '250px' }}>
                                    <option value="">Select Supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.description}>
                                            {supplier.description}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Serial Number</Form.Label>
                                <Form.Control name="serialNumber" placeholder="Serial Number" value={formData.serialNumber} onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Description</Form.Label>
                                <Form.Control name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Make</Form.Label>
                                <Form.Control name="make" placeholder="Make" value={formData.make} onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Model</Form.Label>
                                <Form.Control name="model" placeholder="Model" value={formData.model} onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={formData.status} onChange={handleChange} style={{ minWidth: '250px' }}>
                                    <option value="">Select Status</option>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Allocated">Allocated</option>
                                    <option value="Installed">Installed</option>
                                    <option value="BER">BER</option>
                                    <option value="Repairs">Repairs</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Location</Form.Label>
                                <Form.Control name="location" placeholder="Location" value={formData.location} onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Size</Form.Label>
                                <Form.Control name="size" placeholder="Size" value={formData.size} onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Form.Group className="mb-3" style={{ width: '100%' }}>
                                <Form.Label>Note</Form.Label>
                                <Form.Control name="note" placeholder="Note" value={formData.note} onChange={handleChange} style={{ minWidth: '250px' }} />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={!isFormValid || loading} className="w-50">
                                {loading ? <Spinner animation="border" size="sm" /> : 'Update Stock'}
                            </Button>
                        </Form>
                    </Stack>
                </Col>
            </Row>
        </Container>
    );
};

export default UpdateStock;