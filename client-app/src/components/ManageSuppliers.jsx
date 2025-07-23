import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Form, Button, Table, Modal, Spinner, Row, Col } from 'react-bootstrap';

const ManageSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [newSupplier, setNewSupplier] = useState({ description: '', contactNumber: '', email: '' });
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Suppliers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuppliers(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            toast.error('Failed to load suppliers.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (email) => {
        if (!email) return 'Email is required.';
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) return 'Invalid email format.';
        return '';
    };

    const validateContactNumber = (number) => {
        if (!number) return 'Contact number is required.';
        if (!/^\(\+\d{2}\) \d{2} \d{3} \d{4}$/.test(number)) return 'Invalid phone number format. Expected: (+XX) XX XXX XXXX';
        return '';
    };

    const handleNewSupplierChange = (e) => {
        const { name, value } = e.target;
        setNewSupplier({ ...newSupplier, [name]: value });

        let errors = { ...validationErrors };
        if (name === 'email') {
            errors.email = validateEmail(value);
        } else if (name === 'contactNumber') {
            errors.contactNumber = validateContactNumber(value);
        }
        setValidationErrors(errors);
    };

    const isNewSupplierFormValid = () => {
        const { description, contactNumber, email } = newSupplier;
        const isDescriptionValid = description.trim() !== '';
        const isContactNumberValid = validateContactNumber(contactNumber) === '';
        const isEmailValid = validateEmail(email) === '';

        return isDescriptionValid && isContactNumberValid && isEmailValid;
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5260/api/Suppliers', newSupplier, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Supplier added successfully!', { autoClose: 1000 });
            setNewSupplier({ description: '', contactNumber: '', email: '' });
            fetchSuppliers(); // Refresh the list
        } catch (error) {
            console.error('Failed to add supplier:', error);
            toast.error('Failed to add supplier.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (supplier) => {
        setEditingSupplier({ ...supplier });
        setShowEditModal(true);
    };

    const handleEditModalChange = (e) => {
        setEditingSupplier({ ...editingSupplier, [e.target.name]: e.target.value });
    };

    const handleUpdateSupplier = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5260/api/Suppliers/${editingSupplier.id}`, editingSupplier, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Supplier updated successfully!', { autoClose: 1000 });
            setShowEditModal(false);
            fetchSuppliers(); // Refresh the list
        } catch (error) {
            console.error('Failed to update supplier:', error);
            toast.error('Failed to update supplier.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Manage Suppliers</h4>
            <div style={{ border: '1px solid grey', padding: '1rem' }}>
            <Form onSubmit={handleAddSupplier} className="mb-4">
                <h3>Add New Supplier</h3>
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group controlId="newDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={newSupplier.description}
                                onChange={handleNewSupplierChange}
                                placeholder="Enter supplier description"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="newContactNumber">
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="contactNumber"
                                value={newSupplier.contactNumber}
                                onChange={handleNewSupplierChange}
                                placeholder="Enter contact number (+27) 21 551 3554"
                                required
                                isInvalid={!!validationErrors.contactNumber}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.contactNumber}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="newEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={newSupplier.email}
                                onChange={handleNewSupplierChange}
                                placeholder="Enter email address"
                                required
                                isInvalid={!!validationErrors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.email}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant="primary" type="submit" disabled={loading || !isNewSupplierFormValid()}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Add Supplier'}
                </Button>
            </Form>
            </div>

            <h3 className="mb-3 pt-2">Existing Suppliers</h3>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Contact Number</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id}>
                                <td>{supplier.id}</td>
                                <td>{supplier.description}</td>
                                <td>{supplier.contactNumber}</td>
                                <td>{supplier.email}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleEditClick(supplier)}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Edit Supplier Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Supplier</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingSupplier && (
                        <Form>
                            <Form.Group className="mb-3" controlId="editDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    value={editingSupplier.description}
                                    onChange={handleEditModalChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editContactNumber">
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contactNumber"
                                    value={editingSupplier.contactNumber}
                                    onChange={handleEditModalChange}
                                    required
                                    isInvalid={!!validationErrors.contactNumber}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.contactNumber}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={editingSupplier.email}
                                    onChange={handleEditModalChange}
                                    required
                                    isInvalid={!!validationErrors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdateSupplier} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageSuppliers;