import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Form, Button, Container, Row, Col, Stack, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NewStock = () => {
    const navigate = useNavigate();
    const initialFormData = {
        supplier: '',
        serialNumber: '',
        description: '',
        make: '',
        model: '',
        status: '',
        note: '',
        size: '',
        location: '',
        dateTime: new Date().toISOString(), // Add dateTime field
    };
    const [formData, setFormData] = useState(initialFormData);
    const [stockItems, setStockItems] = useState([]); // Array to hold items before bulk submission
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    const addedFormData = {
        // supplier: '',
        serialNumber: '',
        // description: '',
        // make: '',
        // model: '',
        // status: '',
        // note: '',
        // size: '',
        // location: '',
        dateTime: new Date().toISOString(), // Add dateTime field
    };

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5260/api/Suppliers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSuppliers(response.data.$values);
            } catch (error) {
                console.error('Failed to fetch suppliers:', error);
                toast.error('Failed to load suppliers.', { autoClose: 500 });
            }
        };
        fetchSuppliers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddToArray = (e) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error('Please fill in all fields before adding to the list.', { autoClose: 500 });
            return;
        }

        // Check for duplicate serial number
        if (stockItems.some(item => item.serialNumber === formData.serialNumber)) {
            toast.error(`Serial Number '${formData.serialNumber}' already exists in the list.`, { autoClose: 500 });
            return;
        }

        setStockItems([...stockItems, { ...formData, dateTime: new Date().toISOString() }]);
        // setFormData(initialFormData); // Clear form after adding
        setFormData(addedFormData); // Clear form after adding
        toast.success('Item added to list!', { autoClose: 500 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        let allSuccess = true;
        for (const item of stockItems) {
            try {
                await axios.post('http://localhost:5260/api/serialstock', item, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error('Failed to add stock item:', item, error);
                const errorMessage = error.response?.data?.message || `Failed to add item ${item.serialNumber}.`;
                toast.error(errorMessage, { autoClose: 1000 });
                allSuccess = false;
            }
        }

        if (allSuccess) {
            toast.success('All stock items added successfully!', { autoClose: 500 });
            setStockItems([]); // Clear the list after successful submission
            // Optionally redirect or stay on page
            navigate('/stock');
        } else {
            toast.error('Some items failed to add. Check console for details.', { autoClose: 500 });
        }
        setLoading(false);
    };

    const isFormValid = Object.values(formData).every(field => field.trim() !== '');
    const isAddStockButtonEnabled = stockItems.length > 0;

    return (
        <Container fluid className="py-4"> {/* Added padding top/bottom */}
            <h4 className="mb-2 text-center">Add New Stock</h4>
            <Form className="mb-4">
                <Row className="mb-3">
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="supplier">
                            <Form.Label>Supplier</Form.Label>
                            <Form.Select name="supplier" value={formData.supplier} onChange={handleChange}>
                                <option value="">Select Supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.description}>
                                        {supplier.description}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="serialNumber">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control name="serialNumber" placeholder="Serial Number" value={formData.serialNumber} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="make">
                            <Form.Label>Make</Form.Label>
                            <Form.Select name="make" value={formData.make} onChange={handleChange}>
                                <option value="">Select Make</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.description}>
                                        {supplier.description}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="model">
                            <Form.Label>Model</Form.Label>
                            <Form.Control name="model" placeholder="Model" value={formData.model} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="location">
                            <Form.Label>Location</Form.Label>
                            <Form.Control name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="size">
                            <Form.Label>Size</Form.Label>
                            <Form.Control name="size" placeholder="Size" value={formData.size} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col lg={2} md={6} sm={12}> {/* Status col-lg-2 */}
                        <Form.Group controlId="status">
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="">Select Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Allocated">Allocated</option>
                                <option value="Installed">Installed</option>
                                <option value="BER">BER</option>
                                <option value="Repairs">Repairs</option>
                                <option value="Stolen">Stolen</option>
                                <option value="Dev Sample">Dev Sample</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={12} md={12} sm={12}> {/* Note col-lg-1 */}
                        <Form.Group controlId="note">
                            <Form.Label>Note</Form.Label>
                            <Form.Control name="note" placeholder="Note" value={formData.note} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleAddToArray} disabled={!isFormValid || loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : '+'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            <div className="mb-4" style={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'auto', border: '1px solid #dee2e6' }}>
                <Table striped bordered hover className="mb-0 new-stock-table" style={{ fontSize: '0.8rem' }}> {/* Added new-stock-table class */}
                    <thead>
                        <tr>
                            <th>Supplier</th>
                            <th>Serial Number</th>
                            <th>Description</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Status</th>
                            <th>Size</th>
                            <th>Location</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.supplier}</td>
                                <td>{item.serialNumber}</td>
                                <td>{item.description}</td>
                                <td>{item.make}</td>
                                <td>{item.model}</td>
                                <td>{item.status}</td>
                                <td>{item.size}</td>
                                <td>{item.location}</td>
                                <td>{item.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>


            <Row className="mt-3">
                <Col className="d-flex justify-content-end"> {/* Moved to the right */}
                    <Button variant="primary" onClick={handleSubmit} disabled={!isAddStockButtonEnabled || loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Add Stock'}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NewStock;
