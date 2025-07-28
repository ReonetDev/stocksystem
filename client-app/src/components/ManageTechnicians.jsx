import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Form, Button, Table, Modal, Spinner, Alert } from 'react-bootstrap';

const ManageTechnicians = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentTechnician, setCurrentTechnician] = useState({
        id: 0,
        name: '',
        email: '',
        phone: '',
        active: true,
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [technicianToDelete, setTechnicianToDelete] = useState(null);

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Technicians', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTechnicians(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch technicians:', error);
            toast.error('Failed to load technicians.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setCurrentTechnician({ id: 0, name: '', email: '', phone: '', active: true });
        setShowModal(true);
    };

    const handleEditClick = (tech) => {
        setCurrentTechnician(tech);
        setShowModal(true);
    };

    const handleDeleteClick = (tech) => {
        setTechnicianToDelete(tech);
        setShowDeleteConfirm(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCloseDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setTechnicianToDelete(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentTechnician(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (currentTechnician.id === 0) {
                // Add new technician
                await axios.post('http://localhost:5260/api/Technicians', currentTechnician, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Technician added successfully!');
            } else {
                // Update existing technician
                await axios.put(`http://localhost:5260/api/Technicians/${currentTechnician.id}`, currentTechnician, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Technician updated successfully!');
            }
            fetchTechnicians();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save technician:', error);
            toast.error('Failed to save technician.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5260/api/Technicians/${technicianToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Technician deleted successfully!', { autoClose: 500 });
            fetchTechnicians();
            handleCloseDeleteConfirm();
        } catch (error) {
            console.error('Failed to delete technician:', error);
            toast.error('Failed to delete technician.', { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = currentTechnician.name.trim() !== '' &&
                        currentTechnician.email.trim() !== '' &&
                        currentTechnician.phone.trim() !== '';

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Manage Technicians</h4>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={handleAddClick}>
                    Add Technician
                </Button>
            </div>

            {loading ? (
                <Spinner animation="border" variant="warning" />
            ) : (
                <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {technicians.map(tech => (
                            <tr key={tech.id}>
                                <td>{tech.id}</td>
                                <td>{tech.name}</td>
                                <td>{tech.email}</td>
                                <td>{tech.phone}</td>
                                <td>{tech.active ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleEditClick(tech)} className="me-2">
                                        Edit
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(tech)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentTechnician.id === 0 ? 'Add Technician' : 'Edit Technician'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentTechnician.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={currentTechnician.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={currentTechnician.phone}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="active"
                                label="Active"
                                checked={currentTechnician.active}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={!isFormValid || loading}>
                            {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Save Changes'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteConfirm} onHide={handleCloseDeleteConfirm}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {technicianToDelete && (
                        <Alert variant="danger">
                            Are you sure you want to delete technician <strong>{technicianToDelete.name}</strong>?
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteConfirm}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={loading}>
                        {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageTechnicians;
