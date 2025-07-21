import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Container, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';

const ManageBusinessUnits = () => {
    const [businessUnits, setBusinessUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentBusinessUnit, setCurrentBusinessUnit] = useState({
        id: 0,
        name: '',
        active: true,
    });

    useEffect(() => {
        fetchBusinessUnits();
    }, []);

    const fetchBusinessUnits = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/BusinessUnits', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBusinessUnits(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch business units:', error);
            toast.error('Failed to load business units.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setCurrentBusinessUnit({ id: 0, name: '', active: true });
        setShowModal(true);
    };

    const handleEditClick = (bu) => {
        setCurrentBusinessUnit(bu);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentBusinessUnit(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (currentBusinessUnit.id === 0) {
                // Add new business unit
                await axios.post('http://localhost:5260/api/BusinessUnits', currentBusinessUnit, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Business Unit added successfully!');
            } else {
                // Update existing business unit
                await axios.put(`http://localhost:5260/api/BusinessUnits/${currentBusinessUnit.id}`, currentBusinessUnit, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Business Unit updated successfully!');
            }
            fetchBusinessUnits();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save business unit:', error);
            toast.error('Failed to save business unit.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">Manage Business Units</h2>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={handleAddClick}>
                    Add Business Unit
                </Button>
            </div>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {businessUnits.map(bu => (
                            <tr key={bu.id}>
                                <td>{bu.id}</td>
                                <td>{bu.name}</td>
                                <td>{bu.active ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleEditClick(bu)}>
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
                    <Modal.Title>{currentBusinessUnit.id === 0 ? 'Add Business Unit' : 'Edit Business Unit'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentBusinessUnit.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="active"
                                label="Active"
                                checked={currentBusinessUnit.active}
                                onChange={handleChange}
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

export default ManageBusinessUnits;