import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Spinner, Table } from 'react-bootstrap';

const AllocateSim = () => {
    const [simCards, setSimCards] = useState([]);
    const [filteredSimCards, setFilteredSimCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedSim, setSelectedSim] = useState(null);
    const [allocationData, setAllocationData] = useState({
        simCardId: '',
        type: '',
        location: '',
        device: '',
        allocated: true, // Default to true for allocation
        status: 'Allocated', // Default status for allocation
    });

    
    const statuses = ["Active", "Inactive", "Suspended", "Allocated"];

    useEffect(() => {
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
            setFilteredSimCards(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch sim cards:', error);
            toast.error('Failed to load sim cards.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = simCards.filter(sim =>
            (sim.network || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (sim.type || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (sim.simNumber || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (sim.msisdn || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (sim.location || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (sim.device || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (sim.status || '').toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredSimCards(filtered);
    }, [searchTerm, simCards]);

    const handleSelectSim = (sim) => {
        setSelectedSim(sim);
        setAllocationData({
            simCardId: sim.id,
            location: sim.location,
            device: sim.device || '',
            allocated: sim.allocated,
            status: sim.status,
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAllocationData({ ...allocationData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5260/api/SimCards/allocate', allocationData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Sim Card allocated successfully!');
            setSelectedSim(null);
            setAllocationData({
                simCardId: '',
                location: '',
                device: '',
                allocated: true,
                status: 'Allocated',
            });
            fetchSimCards(); // Refresh the list
        } catch (error) {
            console.error('Failed to allocate sim card:', error);
            toast.error(error.response?.data || 'Failed to allocate sim card.');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = allocationData.simCardId !== '' &&
                        allocationData.location.trim() !== '' &&
                        allocationData.status.trim() !== '';

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">Allocate Sim Card</h2>

            <Row>
                <Col md={6}>
                    <h3>Select Sim Card</h3>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search sim cards..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>
                    {loading ? (
                        <Spinner animation="border" />
                    ) : (
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Network</th>
                                        <th>Type</th>
                                        <th>Sim Number</th>
                                        <th>MSISDN</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSimCards.map(sim => (
                                        <tr key={sim.id} onClick={() => handleSelectSim(sim)} style={{ cursor: 'pointer' }}>
                                            <td>{sim.id}</td>
                                            <td>{sim.network}</td>
                                            <td>{sim.type}</td>
                                            <td>{sim.simNumber}</td>
                                            <td>{sim.msisdn}</td>
                                            <td>{sim.location}</td>
                                            <td>{sim.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Col>

                <Col md={6}>
                    <h3>Allocation Details</h3>
                    {selectedSim ? (
                        <Form onSubmit={handleAllocate}>
                            <Form.Group className="mb-3">
                                <Form.Label>Sim Card ID</Form.Label>
                                <Form.Control type="text" value={selectedSim.id} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Network</Form.Label>
                                <Form.Control type="text" value={selectedSim.network} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Type</Form.Label>
                                <Form.Control type="text" value={selectedSim.type} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Sim Number</Form.Label>
                                <Form.Control type="text" value={selectedSim.simNumber} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>MSISDN</Form.Label>
                                <Form.Control type="text" value={selectedSim.msisdn} disabled />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control name="location" placeholder="Location" value={allocationData.location} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Device</Form.Label>
                                <Form.Control name="device" placeholder="Device" value={allocationData.device} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={allocationData.status} onChange={handleChange}>
                                    <option value="">Select Status</option>
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    name="allocated"
                                    label="Allocated"
                                    checked={allocationData.allocated}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={!isFormValid || loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Allocate Sim'}
                            </Button>
                        </Form>
                    ) : (
                        <p>Select a Sim Card from the list to allocate.</p>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AllocateSim;
