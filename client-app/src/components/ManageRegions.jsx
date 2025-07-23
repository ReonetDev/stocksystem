import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';

const ManageRegions = () => {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentRegion, setCurrentRegion] = useState({
        id: 0,
        name: '',
    });

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Regions', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRegions(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch regions:', error);
            toast.error('Failed to load regions.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setCurrentRegion({ id: 0, name: '' });
        setShowModal(true);
    };

    const handleEditClick = (region) => {
        setCurrentRegion(region);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentRegion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (currentRegion.id === 0) {
                // Add new region
                await axios.post('http://localhost:5260/api/Regions', currentRegion, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Region added successfully!');
            } else {
                // Update existing region
                await axios.put(`http://localhost:5260/api/Regions/${currentRegion.id}`, currentRegion, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Region updated successfully!');
            }
            fetchRegions();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save region:', error);
            toast.error(error.response?.data || 'Failed to save region.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Manage Regions</h4>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={handleAddClick}>
                    Add Region
                </Button>
            </div>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regions.map(region => (
                            <tr key={region.id}>
                                <td>{region.id}</td>
                                <td>{region.name}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleEditClick(region)}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentRegion.id === 0 ? 'Add Region' : 'Edit Region'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentRegion.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ManageRegions;