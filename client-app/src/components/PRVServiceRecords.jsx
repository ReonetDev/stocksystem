import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Container, Row, Col, Form, Table, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PRVServiceRecords = () => {
    const [prvDevices, setPrvDevices] = useState([]);
    const [selectedPrvDeviceId, setSelectedPrvDeviceId] = useState('');
    const [serviceRecords, setServiceRecords] = useState([]);
    const [serviceDocuments, setServiceDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPrvDevices();
    }, []);

    const fetchPrvDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/PRVServices/prvdevices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPrvDevices(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch PRV devices:', error);
            toast.error('Failed to load PRV devices.');
        }
    };

    const fetchServiceRecords = async (prvDeviceId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5260/api/PRVServices?prvDeviceId=${prvDeviceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServiceRecords(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch service records:', error);
            toast.error('Failed to load service records.');
        } finally {
            setLoading(false);
        }
    };

    const fetchServiceDocuments = async (serviceId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5260/api/PRVServices/${serviceId}/documents`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServiceDocuments(prev => [...prev, ...response.data.$values]);
        } catch (error) {
            console.error(`Failed to fetch documents for service ${serviceId}:`, error);
            toast.error(`Failed to load documents for service ${serviceId}.`);
        }
    };

    useEffect(() => {
        if (selectedPrvDeviceId) {
            setServiceRecords([]);
            setServiceDocuments([]);
            fetchServiceRecords(selectedPrvDeviceId);
        }
    }, [selectedPrvDeviceId]);

    useEffect(() => {
        if (serviceRecords.length > 0) {
            setServiceDocuments([]); // Clear documents before fetching new ones
            serviceRecords.forEach(record => {
                fetchServiceDocuments(record.id);
            });
        }
    }, [serviceRecords]);

    const handleDownloadDocument = (filePath, fileName) => {
        window.open(filePath, '_blank');
    };

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">PRV Service Records</h2>
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={2}>Select PRV</Form.Label>
                <Col sm={10}>
                    <Form.Control as="select" value={selectedPrvDeviceId} onChange={e => setSelectedPrvDeviceId(e.target.value)}>
                        <option value="">Select a PRV</option>
                        {prvDevices.map(prv => (
                            <option key={prv.id} value={prv.id}>{prv.businessUnit} - {prv.client} - {prv.region} - {prv.site} - {prv.supplyDescription}</option>
                        ))}
                    </Form.Control>
                </Col>
            </Form.Group>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                selectedPrvDeviceId && (
                    <>
                        <h3 className="mt-5 mb-3">Service History</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Service Date</th>
                                        <th>Service Interval</th>
                                        <th>Service Type</th>
                                        <th>Last Service Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceRecords.map(record => (
                                        <tr key={record.id}>
                                            <td>{new Date(record.nextServiceDate).toLocaleDateString()}</td>
                                            <td>{record.serviceInterval}</td>
                                            <td>{record.serviceType}</td>
                                            <td>{new Date(record.lastServiceDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        <h3 className="mt-5 mb-3">Attached Documents</h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Attachment Type</th>
                                        <th>Upload Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceDocuments.map(doc => (
                                        <tr key={doc.id}>
                                            <td>{doc.fileName}</td>
                                            <td>{doc.attachmentType}</td>
                                            <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                            <td>
                                                <Button variant="info" size="sm" onClick={() => handleDownloadDocument(doc.filePath, doc.fileName)}>Download</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </>
                )
            )}
        </Container>
    );
};

export default PRVServiceRecords;