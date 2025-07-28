import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Row, Col, Table, Form, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SimList = () => {
    const [simCards, setSimCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentUserRole(localStorage.getItem('role'));
        fetchSimCards();
    }, []);

    const fetchSimCards = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/SimCards', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSimCards(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch sim cards:', error);
            toast.error('Failed to load sim cards.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/update-sim/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this Sim Card?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5260/api/SimCards/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Sim Card deleted successfully!', { autoClose: 500 });
                fetchSimCards(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete sim card:', error);
                toast.error('Failed to delete sim card.', { autoClose: 500 });
            }
        }
    };

    const filteredSimCards = simCards.filter(sim =>
        (sim.network || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.simNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.msisdn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.device || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.status || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Sim Card List</h4>
            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search sim cards..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </Form.Group>
            {loading ? (
                <Spinner animation="border" variant="warning" />
            ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Network</th>
                                <th>Type</th>
                                <th>Sim Number</th>
                                <th>MSISDN</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSimCards.map(sim => (
                                <tr key={sim.id}>
                                    <td>{sim.id}</td>
                                    <td>{sim.network}</td>
                                    <td>{sim.type}</td>
                                    <td>{sim.simNumber}</td>
                                    <td>{sim.msisdn}</td>
                                    <td>{sim.location}</td>
                                    <td>{sim.status}</td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => handleEdit(sim.id)} className="me-2">Edit</Button>
                                    {currentUserRole === 'SysAdmin' && (
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(sim.id)}>Delete</Button>
                                    )}   
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default SimList;
