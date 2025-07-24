import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateSim = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        network: '',
        type: '', // Add new type field
        simNumber: '',
        pin: '',
        puk: '',
        msisdn: '',
        startDate: '',
        period: '',
        endDate: '',
        allocated: false,
        location: '',
        device: '',
        status: '',
    });
    const [loading, setLoading] = useState(false);

    const networks = ["MTN", "Vodacom", "Cell C", "Telkom"];
    const simTypes = ["Voice", "Data", "Machine"];
    const periods = [12, 24, 36, 48];
    const locations = ["CPT Office", "JHB Office", "Steven VAN", "Jan VAN", "Joseph VAN", "Kirshwin VAN"];
    const statuses = ["Active", "Inactive", "Suspended", "Spare"];

    useEffect(() => {
        const fetchSimCard = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5260/api/SimCards/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const simData = response.data;
                setFormData({
                    ...simData,
                    startDate: simData.startDate.split('T')[0], // Format for date input
                    endDate: simData.endDate.split('T')[0],     // Format for date input
                });
            } catch (error) {
                console.error('Failed to fetch sim card:', error);
                toast.error('Failed to load sim card data.');
                navigate('/update-sim'); // Redirect if sim not found or error
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSimCard();
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevFormData => {
            let newFormData = { ...prevFormData, [name]: type === 'checkbox' ? checked : value };

            if (name === 'startDate' || name === 'period') {
                const startDate = new Date(newFormData.startDate);
                const period = parseInt(newFormData.period);

                if (!isNaN(startDate.getTime()) && !isNaN(period)) {
                    const endDate = new Date(startDate);
                    endDate.setMonth(startDate.getMonth() + period);
                    newFormData.endDate = endDate.toISOString().split('T')[0];
                }
            }
            return newFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5260/api/SimCards/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Sim Card updated successfully!', { autoClose: 500 });
            navigate('/sim-list'); // Redirect to a list or another appropriate page
        } catch (error) {
            console.error('Failed to update sim card:', error);
            toast.error('Failed to update sim card.', { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = Object.values(formData).every(field => {
        if (typeof field === 'boolean') return true; // For 'allocated'
        return field.toString().trim() !== '';
    });

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Update Sim Card</h4>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="network">
                            <Form.Label>Network</Form.Label>
                            <Form.Select name="network" value={formData.network} onChange={handleChange}>
                                <option value="">Select Network</option>
                                {networks.map((net) => (
                                    <option key={net} value={net}>{net}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="type">
                            <Form.Label>Type</Form.Label>
                            <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                <option value="">Select Type</option>
                                {simTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="simNumber">
                            <Form.Label>Sim Number</Form.Label>
                            <Form.Control name="simNumber" placeholder="Sim Number" value={formData.simNumber} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="pin">
                            <Form.Label>PIN</Form.Label>
                            <Form.Control name="pin" placeholder="PIN" value={formData.pin} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="puk">
                            <Form.Label>PUK</Form.Label>
                            <Form.Control name="puk" placeholder="PUK" value={formData.puk} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="msisdn">
                            <Form.Label>MSISDN</Form.Label>
                            <Form.Control name="msisdn" placeholder="MSISDN" value={formData.msisdn} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="startDate">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="period">
                            <Form.Label>Period</Form.Label>
                            <Form.Select name="period" value={formData.period} onChange={handleChange}>
                                <option value="">Select Period</option>
                                {periods.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="endDate">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="location">
                            <Form.Label>Location</Form.Label>
                            <Form.Control name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="device">
                            <Form.Label>Device</Form.Label>
                            <Form.Control name="device" placeholder="Device" value={formData.device} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="status">
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="">Select Status</option>
                                {statuses.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="allocated" className="d-flex align-items-end h-100">
                            <Form.Check
                                type="checkbox"
                                name="allocated"
                                label="Allocated"
                                checked={formData.allocated}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-end">
                        <Button variant="primary" type="submit" disabled={!isFormValid || loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Update Sim Card'}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default UpdateSim;
