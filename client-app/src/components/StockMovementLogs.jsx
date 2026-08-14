import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Form, Table, Spinner, Row, Col } from 'react-bootstrap';

const StockMovementLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        setCurrentUserRole(role);
        if (role === 'SysAdmin' || role === 'Admin') {
            fetchLogs();
        } else {
            toast.error('You do not have permission to view this page.', { autoClose: 1000 });
        }
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/stockmovementlogs', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(response.data.$values || response.data);
        } catch (error) {
            console.error('Failed to fetch stock movement logs:', error);
            toast.error('Failed to load stock movement logs.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    if (currentUserRole !== 'SysAdmin' && currentUserRole !== 'Admin') {
        return (
            <Container fluid className="py-4">
                <h2 className="mb-4">Access Denied</h2>
                <p>You do not have the necessary permissions to view this page.</p>
            </Container>
        );
    }

    const filteredLogs = logs.filter(log => {
        if (entityTypeFilter && log.entityType !== entityTypeFilter) return false;
        if (actionFilter && log.action !== actionFilter) return false;
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
            (log.itemIdentifier || '').toLowerCase().includes(term) ||
            (log.changes || '').toLowerCase().includes(term) ||
            (log.userName || '').toLowerCase().includes(term)
        );
    });

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Stock Movement Logs</h4>
            <div style={{ border: '1px solid grey', padding: '1rem' }}>
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group controlId="searchTerm">
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search by item, changes, or user"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="entityTypeFilter">
                            <Form.Label>Stock Type</Form.Label>
                            <Form.Select
                                value={entityTypeFilter}
                                onChange={(e) => setEntityTypeFilter(e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="SerialStock">Serial Stock</option>
                                <option value="Consumable">Consumables</option>
                                <option value="SimCard">SIM Cards</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="actionFilter">
                            <Form.Label>Action</Form.Label>
                            <Form.Select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="Created">Created</option>
                                <option value="Updated">Updated</option>
                                <option value="Allocated">Allocated</option>
                                <option value="Deleted">Deleted</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" variant="warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Stock Type</th>
                                    <th>Item</th>
                                    <th>Action</th>
                                    <th>Changes</th>
                                    <th>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td>{log.entityType}</td>
                                        <td>{log.itemIdentifier || '-'}</td>
                                        <td>{log.action}</td>
                                        <td>{log.changes || '-'}</td>
                                        <td>{log.userName || 'Unknown'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {filteredLogs.length === 0 && (
                            <p className="text-center text-muted mt-3">No stock movements found.</p>
                        )}
                    </div>
                )}
            </div>
        </Container>
    );
};

export default StockMovementLogs;
