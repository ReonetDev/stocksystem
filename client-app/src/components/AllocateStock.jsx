import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Form, Button, Container, Row, Col, Spinner, Table } from 'react-bootstrap';

const AllocateStock = () => {
    const navigate = useNavigate();
    const initialFormData = {
        serialNumber: '',
        location: '',
        status: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [stockItemsToUpdate, setStockItemsToUpdate] = useState([]);
    const [loading, setLoading] = useState(false);
    const [foundStock, setFoundStock] = useState(null);
    const [generateDeliveryNote, setGenerateDeliveryNote] = useState(false);
    const [deliveryNoteComments, setDeliveryNoteComments] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearch = async () => {
        setLoading(true);
        setFoundStock(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5260/api/serialstock/bySerialNumber/${formData.serialNumber}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFoundStock(response.data);
            setFormData(prev => ({ ...prev, location: response.data.location, status: response.data.status }));
            toast.success('Stock item found!', { autoClose: 1000 });
        } catch (error) {
            console.error('Failed to search stock:', error);
            toast.error('Stock item not found or an error occurred.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToArray = () => {
        if (!foundStock || !formData.location || !formData.status) {
            toast.error('Please search for a stock item and select a location and status.', { autoClose: 1000 });
            return;
        }

        const itemToAdd = {
            ...foundStock,
            location: formData.location,
            status: formData.status,
        };

        setStockItemsToUpdate(prev => {
            const existingIndex = prev.findIndex(item => item.id === itemToAdd.id);
            if (existingIndex > -1) {
                const updatedItems = [...prev];
                updatedItems[existingIndex] = itemToAdd;
                toast.info('Stock item updated in list.', { autoClose: 500 });
                return updatedItems;
            } else {
                toast.success('Stock item added to list!', { autoClose: 500 });
                return [...prev, itemToAdd];
            }
        });

        setFormData(initialFormData); // Clear form after adding
        setFoundStock(null);
    };

    const handleBulkUpdate = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            let deliveryNoteId = null;

            // Step 1: If requested, create the delivery note first.
            if (generateDeliveryNote) {
                if (stockItemsToUpdate.length === 0) {
                    toast.error("Please add items to the list before generating a delivery note.");
                    return;
                }

                const deliveryNoteDto = {
                    DateTime: new Date().toISOString(),
                    Destination: stockItemsToUpdate[0]?.location || 'N/A',
                    Comments: deliveryNoteComments || 'No comments provided.',
                    Items: stockItemsToUpdate.map(item => ({
                        SerialStockId: item.id
                    }))
                };

                try {
                    const response = await axios.post('http://localhost:5260/api/deliverynotes', deliveryNoteDto, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    deliveryNoteId = response.data.id;
                    toast.success('Delivery note created successfully!');
                } catch (error) {
                    console.error('Failed to create delivery note:', error.response?.data || error.message);
                    const errorMessage = error.response?.data?.title || error.response?.data || 'Failed to create delivery note.';
                    toast.error(errorMessage);
                    return; // Abort if delivery note fails
                }
            }

            // Step 2: Update all stock items.
            let allUpdatesSucceeded = true;
            for (const item of stockItemsToUpdate) {
                try {
                    await axios.put(`http://localhost:5260/api/serialstock/${item.id}`, item, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } catch (error) {
                    console.error(`Failed to update stock item ${item.serialNumber}:`, error);
                    toast.error(`Failed to update item ${item.serialNumber}.`);
                    allUpdatesSucceeded = false;
                }
            }

            // Step 3: Finalize based on success.
            if (allUpdatesSucceeded) {
                toast.success('All selected stock items updated successfully!');
                setStockItemsToUpdate([]);
                setDeliveryNoteComments('');
                setGenerateDeliveryNote(false);

                if (deliveryNoteId) {
                    navigate(`/delivery-note/${deliveryNoteId}`);
                }
            } else {
                toast.error('Some items failed to update. Please check the list and try again.');
            }

        } finally {
            setLoading(false);
        }
    };

    const isSearchDisabled = !formData.serialNumber || loading;
    const isAddToArrayDisabled = !foundStock || !formData.location || !formData.status || loading;
    const isBulkUpdateDisabled = stockItemsToUpdate.length === 0 || loading;

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Allocate Stock</h4>

            <Form className="mb-4">
                <Row className="mb-3 align-items-end">
                    <Col md={4}>
                        <Form.Group controlId="serialNumber">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                placeholder="Enter Serial Number"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Button variant="primary" onClick={handleSearch} disabled={isSearchDisabled}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                        </Button>
                    </Col>
                </Row>

                {foundStock && (
                    <>
                        <Row className="mb-3">
                            <Col lg={3} md={6} sm={12}>
                                <Form.Group controlId="foundDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control type="text" value={foundStock.description} disabled />
                                </Form.Group>
                            </Col>
                            <Col lg={3} md={6} sm={12}>
                                <Form.Group controlId="foundMake">
                                    <Form.Label>Make</Form.Label>
                                    <Form.Control type="text" value={foundStock.make} disabled />
                                </Form.Group>
                            </Col>
                            <Col lg={3} md={6} sm={12}>
                                <Form.Group controlId="foundModel">
                                    <Form.Label>Model</Form.Label>
                                    <Form.Control type="text" value={foundStock.model} disabled />
                                </Form.Group>
                            </Col>
                            <Col lg={3} md={6} sm={12}>
                                <Form.Group controlId="foundSize">
                                    <Form.Label>Size</Form.Label>
                                    <Form.Control type="text" value={foundStock.size} disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col lg={3} md={6} sm={12}>
                                <Form.Group controlId="foundSupplier">
                                    <Form.Label>Supplier</Form.Label>
                                    <Form.Control type="text" value={foundStock.supplier} disabled />
                                </Form.Group>
                            </Col>
                            <Col lg={3} md={6} sm={12}>
                                <Form.Group controlId="foundNote">
                                    <Form.Label>Note</Form.Label>
                                    <Form.Control type="text" value={foundStock.note} disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                )}

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group controlId="location">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter Location"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="status">
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="">Select Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Allocated">Allocated</option>
                                <option value="Installed">Installed</option>
                                <option value="BER">BER</option>
                                <option value="Repairs">Repairs</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                        <Button variant="secondary" onClick={handleAddToArray} disabled={isAddToArrayDisabled}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Add to List'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            <h3 className="mb-3">Stock Items to Update</h3>
            {stockItemsToUpdate.length === 0 ? (
                <p>No items added for update.</p>
            ) : (
                <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', border: '1px solid #dee2e6' }}>
                    <Table striped bordered hover className="mb-0">
                        <thead>
                            <tr>
                                <th>Serial Number</th>
                                <th>Description</th>
                                <th>Make</th>
                                <th>Model</th>
                                <th>Size</th>
                                <th>Supplier</th>
                                <th>Note</th>
                                <th>Location</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockItemsToUpdate.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.serialNumber}</td>
                                    <td>{item.description}</td>
                                    <td>{item.make}</td>
                                    <td>{item.model}</td>
                                    <td>{item.size}</td>
                                    <td>{item.supplier}</td>
                                    <td>{item.note}</td>
                                    <td>{item.location}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            <Row className="mt-3">
                <Col>
                    <Form.Check
                        type="checkbox"
                        label="Generate Delivery Note"
                        checked={generateDeliveryNote}
                        onChange={(e) => setGenerateDeliveryNote(e.target.checked)}
                    />
                </Col>
            </Row>

            {generateDeliveryNote && (
                <Row className="mt-3">
                    <Col>
                        <Form.Group controlId="deliveryNoteComments">
                            <Form.Label>Delivery Note Comments</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={deliveryNoteComments}
                                onChange={(e) => setDeliveryNoteComments(e.target.value)}
                                placeholder="Enter comments for the delivery note"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            )}

            <Row className="mt-3">
                <Col className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleBulkUpdate} disabled={isBulkUpdateDisabled}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Update Stock'}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default AllocateStock;
