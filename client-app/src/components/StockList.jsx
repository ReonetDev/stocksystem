import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Spinner, Table, Button, Form, Row, Col, Container } from 'react-bootstrap';

const StockList = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        setCurrentUserRole(localStorage.getItem('role'));
        const fetchStock = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5260/api/serialstock', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setStock(response.data.$values);
                
            } catch (error) {
                console.error('Failed to fetch stock', error);
                const errorMessage = error.response?.data?.message || 'Failed to fetch stock. Please try again.';
                toast.error(errorMessage, { autoClose: 500 });
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, []);

    const filteredStock = stock.filter(item =>
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:5260/api/serialstock/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setStock(stock.filter((item) => item.id !== id));
                toast.success('Stock item deleted successfully!', { autoClose: 500 });
            } catch (error) {
                console.error('Failed to delete stock', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete stock. Please try again.';
                toast.error(errorMessage, { autoClose: 500 });
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container fluid className="py-4 px-4"> {/* Added padding to Container */}
            <h4 className="mb-2 text-center">Update Stock</h4>

            <Form.Group className="mb-3">
                <Row className="align-items-center">
                    <Col xs="auto">
                        <Form.Label className="me-2 fw-bold">Search</Form.Label>
                    </Col>
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Search by Serial Number"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                </Row>
            </Form.Group>

            {filteredStock.length === 0 ? (
                <p>No stock items found. Add a new one!</p>
            ) : (
                <div style={{ maxHeight: '750px', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }} >
                    <thead>
                        <tr>
                            <th>Supplier</th>
                            <th>Serial Number</th>
                            <th>Description</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th>Note</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map((item) => (
                            <tr key={item.id}>
                                <td>{item.supplier}</td>
                                <td>{item.serialNumber}</td>
                                <td>{item.description}</td>
                                <td>{item.make}</td>
                                <td>{item.model}</td>
                                <td>{item.status}</td>
                                <td>{item.location}</td>
                                <td>{item.note}</td>
                                <td>
                                    <Link to={`/update/${item.id}`} className="btn btn-info btn-sm me-2">Edit</Link>
                                    {currentUserRole === 'SysAdmin' && (
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
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

export default StockList;
