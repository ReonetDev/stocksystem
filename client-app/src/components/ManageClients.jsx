import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';

const ManageClients = () => {
    const [clients, setClients] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentClient, setCurrentClient] = useState({
        id: 0,
        name: '',
        businessUnitId: '',
    });

    useEffect(() => {
        fetchClients();
        fetchBusinessUnits();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Clients', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClients(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            toast.error('Failed to load clients.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBusinessUnits = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/BusinessUnits', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBusinessUnits(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch business units:', error);
            toast.error('Failed to load business units for dropdown.');
        }
    };

    const handleAddClick = () => {
        setCurrentClient({ id: 0, name: '', businessUnitId: '' });
        setShowModal(true);
    };

    const handleEditClick = (client) => {
        setCurrentClient({ ...client, businessUnitId: client.businessUnitId });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentClient(prev => ({
            ...prev,
            [name]: name === 'businessUnitId' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (currentClient.id === 0) {
                // Add new client
                await axios.post('http://localhost:5260/api/Clients', currentClient, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Client added successfully!');
            } else {
                // Update existing client
                await axios.put(`http://localhost:5260/api/Clients/${currentClient.id}`, currentClient, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Client updated successfully!');
            }
            fetchClients();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save client:', error);
            toast.error('Failed to save client.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Manage Clients</h4>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={handleAddClick}>
                    Add Client
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
                            <th>Business Unit</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id}>
                                <td>{client.id}</td>
                                <td>{client.name}</td>
                                <td>{client.businessUnit ? client.businessUnit.name : 'N/A'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleEditClick(client)}>
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
                    <Modal.Title>{currentClient.id === 0 ? 'Add Client' : 'Edit Client'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentClient.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Business Unit</Form.Label>
                            <Form.Select
                                name="businessUnitId"
                                value={currentClient.businessUnitId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Business Unit</option>
                                {businessUnits.map(bu => (
                                    <option key={bu.id} value={bu.id}>
                                        {bu.name}
                                    </option>
                                ))}
                            </Form.Select>
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

export default ManageClients;