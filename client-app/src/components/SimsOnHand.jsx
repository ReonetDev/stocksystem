import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Container, Row, Col, Table, Form, Spinner, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const SimsOnHand = () => {
    const [simCards, setSimCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        } catch (error) {
            console.error('Failed to fetch sim cards:', error);
            toast.error('Failed to load sim cards.');
        } finally {
            setLoading(false);
        }
    };

    const filteredSimCards = simCards.filter(sim =>
        (sim.network || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.simNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.pin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.puk || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.msisdn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.period || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.device || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sim.status || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToExcel = () => {
        const simData = filteredSimCards.map(sim => ({
            ID: sim.id,
            Network: sim.network,
            Type: sim.type,
            'Sim Number': sim.simNumber,
            PIN: sim.pin,
            PUK: sim.puk,
            MSISDN: sim.msisdn,
            'Start Date': new Date(sim.startDate).toLocaleDateString(),
            Period: sim.period,
            'End Date': new Date(sim.endDate).toLocaleDateString(),
            Allocated: sim.allocated ? 'Yes' : 'No',
            Location: sim.location,
            Device: sim.device,
            Status: sim.status,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(simData);
        XLSX.utils.book_append_sheet(wb, ws, 'Sim Cards');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Sim_Cards_On_Hand.xlsx');
    };

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">Sim Cards On Hand</h2>

            <div className="d-flex justify-content-end mb-4">
                <Button variant="success" onClick={exportToExcel}>
                    Export to Excel
                </Button>
            </div>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search sim cards..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Network</th>
                                    <th>Type</th>
                                    <th>Sim Number</th>
                                    <th>PIN</th>
                                    <th>PUK</th>
                                    <th>MSISDN</th>
                                    <th>Start Date</th>
                                    <th>Period</th>
                                    <th>End Date</th>
                                    <th>Allocated</th>
                                    <th>Location</th>
                                    <th>Device</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSimCards.map(sim => (
                                    <tr key={sim.id}>
                                        <td>{sim.id}</td>
                                        <td>{sim.network}</td>
                                        <td>{sim.type}</td>
                                        <td>{sim.simNumber}</td>
                                        <td>{sim.pin}</td>
                                        <td>{sim.puk}</td>
                                        <td>{sim.msisdn}</td>
                                        <td>{new Date(sim.startDate).toLocaleDateString()}</td>
                                        <td>{sim.period}</td>
                                        <td>{new Date(sim.endDate).toLocaleDateString()}</td>
                                        <td>{sim.allocated ? 'Yes' : 'No'}</td>
                                        <td>{sim.location}</td>
                                        <td>{sim.device}</td>
                                        <td>{sim.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </>
            )}
        </Container>
    );
};

export default SimsOnHand;
