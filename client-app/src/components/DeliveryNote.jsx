import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Table, Spinner, Button } from 'react-bootstrap';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import { toast } from 'react-toastify';
import reologo from '../assets/reologo.gif'; // Re-import the logo image

const DeliveryNote = () => {
    const { id } = useParams();
    const [deliveryNote, setDeliveryNote] = useState(null);
    const [loading, setLoading] = useState(true);

    const handlePrint = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5260/api/deliverynotes/pdf/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Important: responseType must be 'blob'
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // Get filename from Content-Disposition header if available, otherwise default
            const contentDisposition = response.headers['content-disposition'];
            console.log('Content-Disposition header:', contentDisposition);
            let filename = `DeliveryNote_${deliveryNote.delNoteNumber}.pdf`; // Default to a more specific name

            if (contentDisposition) {
                const filenameRegex = /filename\*?=(?:UTF-8'')?"?([^;"\n]*)"?/i;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    try {
                        filename = decodeURIComponent(matches[1].replace(/\+/g, ' '));
                        console.log('Filename after decodeURIComponent:', filename);
                        if (filename.startsWith('DeliveryNote_')) {
                            filename = filename.substring('DeliveryNote_'.length);
                            console.log('Filename after stripping prefix:', filename);
                        }
                    } catch (e) {
                        filename = matches[1].replace(/\+/g, ' ');
                        console.log('Filename after catch (error):', filename);
                    }
                }
            }
            console.log('Final filename for download:', filename);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            toast.error('Failed to generate PDF. Please try again.', { autoClose: 500 });
        }
    };

    useEffect(() => {
        const fetchDeliveryNote = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5260/api/deliverynotes/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDeliveryNote(response.data);
            } catch (error) {
                console.error('Failed to fetch delivery note:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveryNote();
    }, [id]);

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!deliveryNote) {
        return <p>Delivery note not found.</p>;
    }

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4 no-print"> {/* Added no-print class */}
                <Link to="/delivery-notes" className="d-flex align-items-center">
                    <FaArrowLeft className="me-2" /> Back to Delivery Notes
                </Link>
                <Button variant="primary" onClick={handlePrint} disabled={!deliveryNote}>
                    <FaPrint className="me-2" /> Print
                </Button>
            </div>

            {/* Content to be displayed on screen */}
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Delivery Note: {deliveryNote.delNoteNumber}</h2>
                    <img src={reologo} alt="Reonet Logo" style={{ width: '128px', height: 'auto' }} />
                </div>
                <Row className="mb-3">
                    <Col>
                        <strong>Date:</strong> {new Date(deliveryNote.dateTime).toLocaleString()}
                    </Col>
                    <Col>
                        <strong>Destination:</strong> {deliveryNote.destination}
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <strong>Comments:</strong> {deliveryNote.comments}
                    </Col>
                </Row>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Serial Number</th>
                            <th>Description</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveryNote.items.$values.map(item => (
                            <tr key={item.serialStock.id}>
                                <td>{item.serialStock.serialNumber}</td>
                                <td>{item.serialStock.description}</td>
                                <td>{item.serialStock.make}</td>
                                <td>{item.serialStock.model}</td>
                                <td>{item.serialStock.size}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default DeliveryNote;
