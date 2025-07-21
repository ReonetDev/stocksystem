import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Container, Row, Col, Table, Form, Spinner, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const StockOnHand = () => {
    const [stockItems, setStockItems] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stockSearchTerm, setStockSearchTerm] = useState('');
    const [consumableSearchTerm, setConsumableSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const stockResponse = await axios.get('http://localhost:5260/api/SerialStock', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStockItems(stockResponse.data.$values);

                const consumablesResponse = await axios.get('http://localhost:5260/api/consumables', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setConsumables(consumablesResponse.data.$values);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load stock and consumable data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredStockItems = stockItems.filter(item =>
        item.status === 'In Stock' &&
        ((item.type || '').toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
        (item.serialNumber || '').toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(stockSearchTerm.toLowerCase()))
    );

    const filteredConsumables = consumables.filter(item =>
        ((item.type || '').toLowerCase().includes(consumableSearchTerm.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(consumableSearchTerm.toLowerCase()) ||
        (item.supplier || '').toLowerCase().includes(consumableSearchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(consumableSearchTerm.toLowerCase()))
    );

    const exportToExcel = () => {
        const stockData = filteredStockItems.map(item => ({
            ID: item.id,
            Description: item.description,
            'Serial Number': item.serialNumber,
            Status: item.status,
            Location: item.location,
            'Date Added': new Date(item.dateTime).toLocaleDateString(),
        }));

        const consumableData = filteredConsumables.map(item => ({
            ID: item.id,
            Supplier: item.supplier,
            Type: item.type,
            Description: item.description,
            User: item.user,
            Location: item.location,
            Quantity: item.quantity,
        }));

        const wb = XLSX.utils.book_new();

        const ws1 = XLSX.utils.json_to_sheet(stockData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Stock Items');

        const ws2 = XLSX.utils.json_to_sheet(consumableData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Consumable Items');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Stock_On_Hand.xlsx');
    };

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">Stock On Hand</h2>

            <div className="d-flex justify-content-end mb-4">
                <Button variant="success" onClick={exportToExcel}>
                    Export to Excel
                </Button>
            </div>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Row className="mb-4">
                        <Col>
                            <h3>In Stock Items</h3>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search stock items..."
                                    value={stockSearchTerm}
                                    onChange={e => setStockSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Description</th>
                                            <th>Serial Number</th>
                                            <th>Status</th>
                                            <th>Location</th>
                                            <th>Date Added</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStockItems.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.description}</td>
                                                <td>{item.serialNumber}</td>
                                                <td>{item.status}</td>
                                                <td>{item.location}</td>
                                                <td>{new Date(item.dateTime).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <h3>Consumable Items</h3>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search consumable items..."
                                    value={consumableSearchTerm}
                                    onChange={e => setConsumableSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Supplier</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>User</th>
                                            <th>Location</th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredConsumables.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.supplier}</td>
                                                <td>{item.type}</td>
                                                <td>{item.description}</td>
                                                <td>{item.user}</td>
                                                <td>{item.location}</td>
                                                <td>{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default StockOnHand;
