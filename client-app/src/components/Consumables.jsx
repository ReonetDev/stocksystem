import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Table, Spinner } from 'react-bootstrap';

const Consumables = () => {
    const [addConsumableFormData, setAddConsumableFormData] = useState({
        supplier: '',
        type: '',
        description: '',
        quantity: '',
        location: '', // Default location
    });
    const [allocateConsumableFormData, setAllocateConsumableFormData] = useState({
        consumableType: '',
        description: '',
        sourceLocation: '',
        destinationLocation: '',
        quantity: '',
    });
    const [consumables, setConsumables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [consumableTypes, setConsumableTypes] = useState([]); // To store unique consumable types
    const [filteredDescriptions, setFilteredDescriptions] = useState([]); // To store descriptions based on selected type

    const sourceLocations = ["CPT Office", "JHB Office", "Steven VAN", "Jan VAN", "Joseph VAN", "Kirshwin VAN"];
    const destinationLocations = [...sourceLocations, "SITE"];

    useEffect(() => {
        fetchConsumables();
        fetchSuppliers();
    }, []);

    const fetchConsumables = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/consumables', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConsumables(response.data.$values);
            // Extract unique consumable types
            const types = [...new Set(response.data.$values.map(c => c.type))];
            setConsumableTypes(types);
        } catch (error) {
            console.error('Failed to fetch consumables:', error);
            toast.error('Failed to load consumables.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Suppliers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuppliers(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            toast.error('Failed to load suppliers.');
        }
    };

    const handleAddConsumableChange = (e) => {
        setAddConsumableFormData({ ...addConsumableFormData, [e.target.name]: e.target.value });
    };

    const handleAllocateConsumableChange = (e) => {
        const { name, value } = e.target;
        setAllocateConsumableFormData(prevData => {
            const newData = { ...prevData, [name]: value };
            if (name === 'consumableType') {
                const descriptions = [...new Set(consumables.filter(c => c.type === value).map(c => c.description))];
                setFilteredDescriptions(descriptions);
                newData.description = ''; // Reset description when type changes
            }
            return newData;
        });
    };

    const handleAddConsumable = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userResponse = await axios.get('http://localhost:5260/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userName = userResponse.data.firstName; // Assuming firstName is the user name

            const consumableToAdd = {
                ...addConsumableFormData,
                quantity: parseInt(addConsumableFormData.quantity),
                user: userName, // Set the logged-in user
            };

            await axios.post('http://localhost:5260/api/consumables', consumableToAdd, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Consumable added successfully!');
            setAddConsumableFormData({
                supplier: '',
                type: '',
                description: '',
                quantity: '',
                location: '',
            });
            fetchConsumables();
        } catch (error) {
            console.error('Failed to add consumable:', error);
            toast.error('Failed to add consumable.', { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    const handleAllocateConsumable = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userResponse = await axios.get('http://localhost:5260/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userName = userResponse.data.firstName; // Assuming firstName is the user name

            const { consumableType, description, sourceLocation, destinationLocation, quantity } = allocateConsumableFormData;
            const quantityToMove = parseInt(quantity);

            const allocateData = {
                consumableType,
                description,
                sourceLocation,
                destinationLocation,
                quantity: quantityToMove,
                user: userName,
            };

            await axios.post('http://localhost:5260/api/consumables/allocate', allocateData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Consumable allocated successfully!');
            setAllocateConsumableFormData({
                consumableType: '',
                sourceLocation: '',
                destinationLocation: '',
                quantity: '',
            });
            fetchConsumables();
        } catch (error) {
            console.error('Failed to allocate consumable:', error);
            toast.error(error.response?.data || 'Failed to allocate consumable.', { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    const isAddConsumableFormValid = () => {
        const { supplier, type, description, quantity, location } = addConsumableFormData;
        return supplier.trim() !== '' && type.trim() !== '' && description.trim() !== '' &&
               quantity !== '' && parseInt(quantity) > 0 && location.trim() !== '';
    };

    const isAllocateConsumableFormValid = () => {
        const { consumableType, description, sourceLocation, destinationLocation, quantity } = allocateConsumableFormData;
        return consumableType.trim() !== '' && description.trim() !== '' && sourceLocation.trim() !== '' &&
               destinationLocation.trim() !== '' && quantity !== '' && parseInt(quantity) > 0;
    };

    const filteredConsumables = consumables.filter(consumable =>
        consumable.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Consumables Management</h4>
            <Row>
                <Col md={6}>
                    {/* Add New Consumable Section */}
                    <div className="mb-4 p-3 border rounded">
                        <h4>Add New Consumable</h4>
                        <Form onSubmit={handleAddConsumable}>
                            <Form.Group className="mb-3">
                                <Form.Label>Supplier</Form.Label>
                                <Form.Select name="supplier" value={addConsumableFormData.supplier} onChange={handleAddConsumableChange}>
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.description}>{supplier.description}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Type</Form.Label>
                                <Form.Control type="text" name="type" value={addConsumableFormData.type} onChange={handleAddConsumableChange} placeholder="e.g., Cable, Connector" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control type="text" name="description" value={addConsumableFormData.description} onChange={handleAddConsumableChange} placeholder="e.g., Cat6 UTP, RJ45" />
                            </Form.Group>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Quantity</Form.Label>
                                        <Form.Control type="number" name="quantity" value={addConsumableFormData.quantity} onChange={handleAddConsumableChange} placeholder="Enter quantity" />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Location</Form.Label>
                                        <Form.Select name="location" value={addConsumableFormData.location} onChange={handleAddConsumableChange}>
                                            <option value="">Select Destination</option>
                                            {sourceLocations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" disabled={!isAddConsumableFormValid() || loading}>
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Add Consumable'}
                                </Button>
                            </div>
                        </Form>
                    </div>

                    {/* Allocate Consumable Section */}
                    <div className="p-3 border rounded">
                        <h4>Allocate Consumable</h4>
                        <Form onSubmit={handleAllocateConsumable}>
                            <Form.Group className="mb-3">
                                <Form.Label>Consumable Type</Form.Label>
                                <Form.Select name="consumableType" value={allocateConsumableFormData.consumableType} onChange={handleAllocateConsumableChange}>
                                    <option value="">Select Type</option>
                                    {consumableTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Select name="description" value={allocateConsumableFormData.description} onChange={handleAllocateConsumableChange} disabled={!allocateConsumableFormData.consumableType}>
                                    <option value="">Select Description</option>
                                    {filteredDescriptions.map(desc => (
                                        <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Source Location</Form.Label>
                                        <Form.Select name="sourceLocation" value={allocateConsumableFormData.sourceLocation} onChange={handleAllocateConsumableChange}>
                                            <option value="">Select Source</option>
                                            {sourceLocations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Destination Location</Form.Label>
                                        <Form.Select name="destinationLocation" value={allocateConsumableFormData.destinationLocation} onChange={handleAllocateConsumableChange}>
                                            <option value="">Select Destination</option>
                                            {destinationLocations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control type="number" name="quantity" value={allocateConsumableFormData.quantity} onChange={handleAllocateConsumableChange} placeholder="Quantity to move" />
                            </Form.Group>
                            <div className="d-flex justify-content-end">
                                <Button variant="success" type="submit" disabled={!isAllocateConsumableFormValid() || loading}>
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Allocate'}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>

                <Col md={6}>
                    {/* Consumables List Table */}
                    <h3>All Consumables</h3>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search consumables..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>
                    {loading ? (
                        <Spinner animation="border" />
                    ) : (
                        <div style={{ maxHeight: '750px', overflowY: 'auto' }}>
                             <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
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
                                {filteredConsumables.map(consumable => (
                                    <tr key={consumable.id}>
                                        <td>{consumable.id}</td>
                                        <td>{consumable.supplier}</td>
                                        <td>{consumable.type}</td>
                                        <td>{consumable.description}</td>
                                        <td>{consumable.user}</td>
                                        <td>{consumable.location}</td>
                                        <td>{consumable.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        </div>

                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Consumables;