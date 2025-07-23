
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Spinner, Form } from 'react-bootstrap';

const DeliveryNotesList = () => {
    const [deliveryNotes, setDeliveryNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDeliveryNotes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5260/api/deliverynotes', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDeliveryNotes(response.data.$values);
            } catch (error) {
                console.error('Failed to fetch delivery notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveryNotes();
    }, []);

    const filteredDeliveryNotes = deliveryNotes.filter(note =>
        note.delNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.comments.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Spinner animation="border" />;
    }

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Delivery Notes</h4>
            <Form.Group as={Row} className="mb-3">
                <Col sm={4}>
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </Col>
            </Form.Group>
            <Table striped bordered hover style={{ fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th>Delivery Note Number</th>
                        <th>Date</th>
                        <th>Destination</th>
                        <th>Comments</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDeliveryNotes.map(note => (
                        <tr key={note.id}>
                            <td>{note.delNoteNumber}</td>
                            <td>{new Date(note.dateTime).toLocaleString()}</td>
                            <td>{note.destination}</td>
                            <td>{note.comments}</td>
                            <td>
                                <Link to={`/delivery-note/${note.id}`}>View</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default DeliveryNotesList;
