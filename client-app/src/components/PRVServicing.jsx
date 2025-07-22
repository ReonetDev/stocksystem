import React, { useState, useEffect, useMemo } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Row, Col, Table, Form, Spinner, Button, Tabs, Tab } from 'react-bootstrap';

const PRVServicing = () => {
    const [prvServices, setPrvServices] = useState([]);
    const [allPrvDevices, setAllPrvDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrv, setSelectedPrv] = useState('');
    const [nextServiceDate, setNextServiceDate] = useState('');
    const [serviceInterval, setServiceInterval] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [editingService, setEditingService] = useState(null);
    const [updateSelectedPrvService, setUpdateSelectedPrvService] = useState('');
    const [updateServiceDate, setUpdateServiceDate] = useState('');
    const [updateServiceInterval, setUpdateServiceInterval] = useState('');
    const [updateServiceType, setUpdateServiceType] = useState('');
    const [attachmentType, setAttachmentType] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchPRVServices();
        fetchAllPrvDevices();
    }, []);

    const fetchPRVServices = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/PRVServices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPrvServices(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch PRV services:', error);
            toast.error('Failed to load PRV services.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllPrvDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/PRVDevices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllPrvDevices(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch all PRV devices:', error);
            toast.error('Failed to load PRV devices.');
        }
    };

    const handleAddService = async () => {
        if (!selectedPrv || !nextServiceDate || !serviceInterval || !serviceType) {
            toast.error('Please fill out all fields.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5260/api/PRVServices', {
                prvDeviceId: selectedPrv,
                nextServiceDate: nextServiceDate,
                serviceInterval: serviceInterval,
                serviceType: serviceType,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Service schedule added successfully!');
            fetchPRVServices();
            fetchAllPrvDevices();
            setSelectedPrv('');
            setNextServiceDate('');
            setServiceInterval('');
            setServiceType('');
        } catch (error) {
            console.error('Failed to add service schedule:', error);
            toast.error('Failed to add service schedule.');
        }
    };

    const handleEditClick = (service) => {
        setEditingService(service);
        setSelectedPrv(service.prvDeviceId);
        setNextServiceDate(service.nextServiceDate.split('T')[0]); // Format date for input
        setServiceInterval(service.serviceInterval);
        setServiceType(service.serviceType || ''); // Set service type, default to empty string if null

        // For update tab
        setUpdateSelectedPrvService(service.id);
        setUpdateServiceDate(service.nextServiceDate.split('T')[0]);
        setUpdateServiceInterval(service.serviceInterval);
        setUpdateServiceType(service.serviceType || '');
    };

    const handleCancelEdit = () => {
        setEditingService(null);
        setSelectedPrv('');
        setNextServiceDate('');
        setServiceInterval('');
        setServiceType('');

        // Clear update tab fields
        setUpdateSelectedPrvService('');
        setUpdateServiceDate('');
        setUpdateServiceInterval('');
        setUpdateServiceType('');
        setAttachmentType('');
        setSelectedFile(null);
    };

    const handleUpdateService = async () => {
        if (!selectedPrv || !nextServiceDate || !serviceInterval || !serviceType) {
            toast.error('Please fill out all fields.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5260/api/PRVServices/${editingService.id}`, {
                id: editingService.id,
                prvDeviceId: selectedPrv,
                nextServiceDate: nextServiceDate,
                serviceInterval: serviceInterval,
                serviceType: serviceType,
                lastServiceDate: editingService.lastServiceDate // Keep the original lastServiceDate
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Service schedule updated successfully!');
            fetchPRVServices();
            fetchAllPrvDevices();
            handleCancelEdit(); // Clear form and exit edit mode
        } catch (error) {
            console.error('Failed to update service schedule:', error);
            toast.error('Failed to update service schedule.');
        }
    };

    const handleUpdateServiceRecord = async () => {
        if (!updateSelectedPrvService || !updateServiceDate || !updateServiceInterval || !updateServiceType) {
            toast.error('Please fill out all required fields for update.');
            return;
        }

        const currentService = prvServices.find(s => s.id == updateSelectedPrvService); // Use == for loose comparison
        if (!currentService) {
            toast.error('Selected service not found.');
            return;
        }

        const formData = new FormData();
        formData.append('Id', updateSelectedPrvService);
        formData.append('PRVDeviceId', currentService.prvDeviceId);
        formData.append('NextServiceDate', updateServiceDate);

        const parsedServiceInterval = parseInt(updateServiceInterval, 10);
        formData.append('ServiceInterval', isNaN(parsedServiceInterval) ? '' : parsedServiceInterval);

        formData.append('ServiceType', updateServiceType || '');

        // Format LastServiceDate to YYYY-MM-DD
        const formattedLastServiceDate = currentService.lastServiceDate ? new Date(currentService.lastServiceDate).toISOString().split('T')[0] : '';
        formData.append('LastServiceDate', formattedLastServiceDate);

        if (selectedFile) {
            formData.append('File', selectedFile);
            formData.append('AttachmentType', attachmentType);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5260/api/PRVServices/${updateSelectedPrvService}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            toast.success('Service record updated successfully!');
            fetchPRVServices();
            handleCancelEdit();
        } catch (error) {
            console.error('Failed to update service record:', error);
            toast.error('Failed to update service record.');
        }
    };

    const filteredPRVServices = prvServices.filter(service =>
        Object.values(service).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const unscheduledPrvs = useMemo(() => {
        const servicedPrvIds = new Set(prvServices.map(service => service.prvDeviceId));
        return allPrvDevices.filter(prv => !servicedPrvIds.has(prv.id));
    }, [allPrvDevices, prvServices]);

    const servicesOverdue = prvServices.filter(service => new Date(service.nextServiceDate) < new Date());
    const servicesDue = prvServices.filter(service => {
        const nextService = new Date(service.nextServiceDate);
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 4);
        return nextService > today && nextService <= sixMonthsFromNow;
    });

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">PRV Servicing</h2>
            <Row className="mb-4">
                <Col md={6}>
                    <div style={{ border: '1px solid red', padding: '1rem' }}>
                        <h4 className="mb-3">Services Overdue</h4>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Business Unit</th>
                                    <th>Client</th>
                                    <th>Region</th>
                                    <th>Site</th>
                                    <th>Supply Description</th>
                                    <th>Size</th>
                                    <th>Make of PRV</th>
                                    <th>Service Date</th>
                                    <th>Service Interval</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicesOverdue.map(service => (
                                    <tr key={service.id}>
                                        <td>{service.businessUnit}</td>
                                        <td>{service.client}</td>
                                        <td>{service.region}</td>
                                        <td>{service.site}</td>
                                        <td>{service.supplyDescription}</td>
                                        <td>{service.prv_size}</td>
                                        <td>{service.prv_make}</td>
                                        <td>{new Date(service.nextServiceDate).toLocaleDateString()}</td>
                                        <td>{service.serviceInterval}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        </div>
                    </div>
                </Col>
                <Col md={6}>
                    <div style={{ border: '1px solid green', padding: '1rem' }}>
                        <h4 className="mb-3">Services Due</h4>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Business Unit</th>
                                    <th>Client</th>
                                    <th>Region</th>
                                    <th>Site</th>
                                    <th>Supply Description</th>
                                    <th>Size</th>
                                    <th>Make of PRV</th>
                                    <th>Service Date</th>
                                    <th>Service Interval</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicesDue.map(service => (
                                    <tr key={service.id}>
                                        <td>{service.businessUnit}</td>
                                        <td>{service.client}</td>
                                        <td>{service.region}</td>
                                        <td>{service.site}</td>
                                        <td>{service.supplyDescription}</td>
                                        <td>{service.prv_size}</td>
                                        <td>{service.prv_make}</td>
                                        <td>{new Date(service.nextServiceDate).toLocaleDateString()}</td>
                                        <td>{service.serviceInterval}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        </div>
                    </div>
                </Col>
            </Row>
            <div style={{ border: '1px solid grey', padding: '1rem' }}>
                <Tabs defaultActiveKey="add-service" id="prv-servicing-tabs" className="mb-3">
                    <Tab eventKey="add-service" title={editingService ? "Edit Service Schedule" : "Add Service Schedule"}>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Select PRV</Form.Label>
                            <Col sm={10}>
                                <Form.Control as="select" value={selectedPrv} onChange={e => setSelectedPrv(e.target.value)}>
                                    <option value="">Select a PRV</option>
                                    {unscheduledPrvs.map(prv => (
                                        // <option key={prv.id} value={prv.id}>{prv.supplyDescription}</option>
                                        <option key={prv.id} value={prv.id}>{prv.businessUnit} - {prv.client} - {prv.region} - {prv.site} - {prv.supplyDescription}</option>
                                    ))}
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Next Service Date</Form.Label>
                            <Col sm={2}>
                                <Form.Control type="date" value={nextServiceDate} onChange={e => setNextServiceDate(e.target.value)} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Service Interval (Months)</Form.Label>
                            <Col sm={2}>
                                <Form.Control as="select" value={serviceInterval} onChange={e => setServiceInterval(e.target.value)}>
                                    <option value="">Select Interval</option>
                                    <option value={3}>3</option>
                                    <option value={6}>6</option>
                                    <option value={9}>9</option>
                                    <option value={12}>12</option>
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Service Type</Form.Label>
                            <Col sm={2}>
                                <Form.Control as="select" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                                    <option value="">Select Service Type</option>
                                    <option value="Normal Service">Normal Service</option>
                                    <option value="Inspection">Inspection</option>
                                    <option value="Emergency Service">Emergency Service</option>
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Row>
                            <Col className="d-flex justify-content-end">
                                {editingService ? (
                                    <>
                                        <Button variant="success" onClick={handleUpdateService} className="me-2" disabled={!selectedPrv || !nextServiceDate || !serviceInterval || !serviceType}>Update Service</Button>
                                        <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                                    </>
                                ) : (
                                    <Button onClick={handleAddService} disabled={!selectedPrv || !nextServiceDate || !serviceInterval || !serviceType}>Add Service</Button>
                                )}
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey="update-service" title="Update Service Record">
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Select PRV Service</Form.Label>
                            <Col sm={10}>
                                <Form.Control as="select" value={updateSelectedPrvService} onChange={e => setUpdateSelectedPrvService(e.target.value)}>
                                    <option value="">Select a PRV Service</option>
                                    {prvServices.map(service => (
                                        <option key={service.id} value={service.id}>{service.businessUnit} - {service.client} - {service.region} - {service.site} - {service.supplyDescription}</option>
                                    ))}
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Service Date</Form.Label>
                            <Col sm={2}>
                                <Form.Control type="date" value={updateServiceDate} onChange={e => setUpdateServiceDate(e.target.value)} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Service Interval (Months)</Form.Label>
                            <Col sm={2}>
                                <Form.Control as="select" value={updateServiceInterval} onChange={e => setUpdateServiceInterval(e.target.value)}>
                                    <option value="">Select Interval</option>
                                    <option value={3}>3</option>
                                    <option value={6}>6</option>
                                    <option value={9}>9</option>
                                    <option value={12}>12</option>
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Service Type</Form.Label>
                            <Col sm={2}>
                                <Form.Control as="select" value={updateServiceType} onChange={e => setUpdateServiceType(e.target.value)}>
                                    <option value="">Select Service Type</option>
                                    <option value="Normal Service">Normal Service</option>
                                    <option value="Inspection">Inspection</option>
                                    <option value="Emergency Service">Emergency Service</option>
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Attachment Type</Form.Label>
                            <Col sm={2}>
                                <Form.Control as="select" value={attachmentType} onChange={e => setAttachmentType(e.target.value)}>
                                    <option value="">Select Attachment Type</option>
                                    <option value="Jobcard">Jobcard</option>
                                    <option value="Quotation">Quotation</option>
                                    <option value="Invoice">Invoice</option>
                                    <option value="Other">Other</option>
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Upload Document</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="file" onChange={e => setSelectedFile(e.target.files[0])} />
                            </Col>
                        </Form.Group>
                        <Row>
                            <Col className="d-flex justify-content-end">
                                <Button onClick={handleUpdateServiceRecord} disabled={!updateSelectedPrvService || !updateServiceDate || !updateServiceInterval || !updateServiceType}>Update Service</Button>
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>
            </div>
            <h3 className="mt-5 mb-3">All PRV Service Schedules</h3>
            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search all services..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </Form.Group>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Business Unit</th>
                            <th>Client</th>
                            <th>Region</th>
                            <th>Site</th>
                            <th>Supply Description</th>
                            <th>Size</th>
                            <th>Make of PRV</th>
                            <th>Last Service</th>
                            <th>Next Service</th>
                            <th>Service Interval</th>
                            <th>Service Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPRVServices.map(service => (
                            <tr key={service.id}>
                                <td>{service.businessUnit}</td>
                                <td>{service.client}</td>
                                <td>{service.region}</td>
                                <td>{service.site}</td>
                                <td>{service.supplyDescription}</td>
                                <td>{service.prv_size}</td>
                                <td>{service.prv_make}</td>
                                <td>{new Date(service.lastServiceDate).toLocaleDateString()}</td>
                                <td>{new Date(service.nextServiceDate).toLocaleDateString()}</td>
                                <td>{service.serviceInterval}</td>
                                <td>{service.serviceType}</td>
                                <td>
                                    <Button variant="primary" size="sm" onClick={() => handleEditClick(service)}>Edit</Button>
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

export default PRVServicing;