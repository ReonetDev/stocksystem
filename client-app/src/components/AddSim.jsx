import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Form, Button, Container, Row, Col, Spinner, Table } from 'react-bootstrap';

const AddSim = () => {
    const initialFormData = {
        network: '',
        type: '', // Add new type field
        simNumber: '',
        pin: '',
        puk: '',
        msisdn: '',
        startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        period: '',
        endDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        allocated: false,
        location: '',
        device: '',
        status: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [simCards, setSimCards] = useState([]); // Array to hold items before bulk submission
    const [loading, setLoading] = useState(false);

    const networks = ["MTN", "Vodacom", "Cell C", "Telkom"];
    const simTypes = ["Voice", "Data", "Machine"];
    const periods = [12, 24, 36, 48];
    const locations = ["CPT Office", "JHB Office", "Steven VAN", "Jan VAN", "Joseph VAN", "Kirshwin VAN"];
    const statuses = ["Active", "Inactive", "Suspended", "Spare"];

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

    const handleAddToArray = (e) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error('Please fill in all required fields before adding to the list.', { autoClose: 500 });
            return;
        }

        // Check for duplicate Sim Number
        if (simCards.some(sim => sim.simNumber === formData.simNumber)) {
            toast.error(`Sim Number '${formData.simNumber}' already exists in the list.`, { autoClose: 500 });
            return;
        }

        setSimCards([...simCards, { ...formData }]);
        setFormData(initialFormData); // Clear form after adding
        toast.success('Sim Card added to list!', { autoClose: 500 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        let allSuccess = true;
        for (const sim of simCards) {
            try {
                await axios.post('http://localhost:5260/api/SimCards', sim, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error('Failed to add sim card:', sim, error);
                const errorMessage = error.response?.data?.message || `Failed to add sim card ${sim.simNumber}.`;
                toast.error(errorMessage, { autoClose: 500 });
                allSuccess = false;
            }
        }

        if (allSuccess) {
            toast.success('All sim cards added successfully!', { autoClose: 500 });
            setSimCards([]); // Clear the list after successful submission
        } else {
            toast.error('Some sim cards failed to add. Check console for details.', { autoClose: 500 });
        }
        setLoading(false);
    };

    const isFormValid = Object.values(formData).every(field => {
        // Exclude 'device' and 'id' from validation if they are optional
        if (typeof field === 'boolean') return true; // For 'allocated'
        return field.toString().trim() !== '';
    });

    const isAddSimButtonEnabled = simCards.length > 0;

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Add New Sim Card</h4>
            <Form className="mb-4">
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
                <Row className="mb-3">
                    <Col className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleAddToArray} disabled={!isFormValid || loading}>
                            {loading ? <Spinner animation="border" variant="warning" size="sm" /> : '+'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            <div className="mb-4" style={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'auto', border: '1px solid #dee2e6' }}>
                <Table striped bordered hover className="mb-0 new-sim-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                        <tr>
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
                        {simCards.map((sim, index) => (
                            <tr key={index}>
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

            <Row className="mt-3">
                <Col className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleSubmit} disabled={!isAddSimButtonEnabled || loading}>
                        {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Add Sim Cards'}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default AddSim;
