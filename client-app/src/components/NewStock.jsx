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
        status: 'In Stock',
        note: '',
        size: '',
        location: '',
        dateTime: new Date().toISOString(), // Add dateTime field
    };
    const [formData, setFormData] = useState(initialFormData);
    const [stockItems, setStockItems] = useState([]); // Array to hold items before bulk submission
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [devices, setDevices] = useState([]);
    const [addingNew, setAddingNew] = useState({ make: false, model: false, size: false });
    const sourceLocations = ["CPT OFFICE", "JHB OFFICE", "STEVEN VAN", "JAN VAN", "JOSEPH VAN", "KIRSHWIN VAN", "DBN VAN"];
    const ADD_NEW_OPTION = '__add_new__';

    const addedFormData = {
        ...initialFormData,
        serialNumber: '',
        description: '',
        make: '',
        model: '',
        size: '',
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
        const fetchDevices = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5260/api/devices', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const devicesData = response.data.$values || response.data.items || response.data.data || response.data;
                if (Array.isArray(devicesData)) {
                    setDevices(devicesData);
                } else {
                    console.error('Fetched device data is not an array:', devicesData);
                    setDevices([]);
                }
            } catch (error) {
                console.error('Failed to fetch devices:', error);
                toast.error('Failed to load devices.', { autoClose: 500 });
            }
        };
        fetchSuppliers();
        fetchDevices();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Description changed: recompute make, and cascade an auto-pick down
        // through model/size whenever only one option is available at each level.
        if (name === 'description') {
            const devicesForDescription = devices.filter(device => device.description === value);
            const uniqueMakes = [...new Set(devicesForDescription.map(device => device.make))].filter(Boolean);
            const autoMake = uniqueMakes.length === 1 ? uniqueMakes[0] : '';

            const devicesForMake = devicesForDescription.filter(device => device.make === autoMake);
            const uniqueModels = [...new Set(devicesForMake.map(device => device.model))].filter(Boolean);
            const autoModel = uniqueModels.length === 1 ? uniqueModels[0] : '';

            const devicesForModel = devicesForMake.filter(device => device.model === autoModel);
            const uniqueSizes = [...new Set(devicesForModel.map(device => device.size))].filter(Boolean);
            const autoSize = uniqueSizes.length === 1 ? uniqueSizes[0] : '';

            setAddingNew({ make: false, model: false, size: false });
            setFormData(prevData => ({
                ...prevData,
                description: value,
                make: autoMake,
                model: autoModel,
                size: autoSize,
            }));
            return;
        }

        // Make changed: cascade an auto-pick through model/size.
        if (name === 'make') {
            const devicesForMake = devices.filter(device =>
                device.description === formData.description && device.make === value
            );
            const uniqueModels = [...new Set(devicesForMake.map(device => device.model))].filter(Boolean);
            const autoModel = uniqueModels.length === 1 ? uniqueModels[0] : '';

            const devicesForModel = devicesForMake.filter(device => device.model === autoModel);
            const uniqueSizes = [...new Set(devicesForModel.map(device => device.size))].filter(Boolean);
            const autoSize = uniqueSizes.length === 1 ? uniqueSizes[0] : '';

            setFormData(prevData => ({
                ...prevData,
                make: value,
                model: autoModel,
                size: autoSize,
            }));
            return;
        }

        // Model changed: cascade an auto-pick through size.
        if (name === 'model') {
            const devicesForModel = devices.filter(device =>
                device.description === formData.description &&
                device.make === formData.make &&
                device.model === value
            );
            const uniqueSizes = [...new Set(devicesForModel.map(device => device.size))].filter(Boolean);
            const autoSize = uniqueSizes.length === 1 ? uniqueSizes[0] : '';

            setFormData(prevData => ({
                ...prevData,
                model: value,
                size: autoSize,
            }));
            return;
        }

        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // Wraps handleChange for the make/model/size selects: choosing the
    // "+ Add new..." option swaps that field over to a free-text input
    // instead of treating the sentinel as a real value.
    const handleDropdownChange = (e) => {
        const { name, value } = e.target;
        if (value === ADD_NEW_OPTION) {
            setAddingNew(prev => {
                if (name === 'make') return { make: true, model: false, size: false };
                if (name === 'model') return { ...prev, model: true, size: false };
                return { ...prev, size: true };
            });
            handleChange({ target: { name, value: '' } });
            return;
        }
        handleChange(e);
    };

    const handleNewValueChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleCancelAddNew = (field) => {
        if (field === 'make') {
            setAddingNew({ make: false, model: false, size: false });
            setFormData(prevData => ({ ...prevData, make: '', model: '', size: '' }));
        } else if (field === 'model') {
            setAddingNew(prev => ({ ...prev, model: false, size: false }));
            setFormData(prevData => ({ ...prevData, model: '', size: '' }));
        } else {
            setAddingNew(prev => ({ ...prev, size: false }));
            setFormData(prevData => ({ ...prevData, size: '' }));
        }
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
        setAddingNew({ make: false, model: false, size: false });
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
                toast.error(errorMessage, { autoClose: 500 });
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

    // Cascading option lists: each level's choices are scoped to what's
    // already selected above it (description -> make -> model -> size).
    const devicesForDescription = formData.description
        ? devices.filter(device => device.description === formData.description)
        : [];
    const makeOptions = [...new Set(devicesForDescription.map(device => device.make))].filter(Boolean);

    const devicesForMake = formData.make
        ? devicesForDescription.filter(device => device.make === formData.make)
        : [];
    const modelOptions = [...new Set(devicesForMake.map(device => device.model))].filter(Boolean);

    const devicesForModel = formData.model
        ? devicesForMake.filter(device => device.model === formData.model)
        : [];
    const sizeOptions = [...new Set(devicesForModel.map(device => device.size))].filter(Boolean);

    const isFormValid = formData.supplier.trim() !== '' &&
                        formData.serialNumber.trim() !== '' &&
                        formData.description.trim() !== '' &&
                        formData.location.trim() !== '' &&
                        formData.status.trim() !== '';
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
                            <Form.Select name="description" value={formData.description} onChange={handleChange}>
                                <option value="">Select Description</option>
                                {[...new Set(devices.map(device => device.description))].map((description, index) => (
                                    <option key={index} value={description}>
                                        {description}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="make">
                            <Form.Label>Make</Form.Label>
                            {addingNew.make ? (
                                <Stack direction="horizontal" gap={2}>
                                    <Form.Control
                                        name="make"
                                        placeholder="New Make"
                                        value={formData.make}
                                        onChange={handleNewValueChange}
                                        autoFocus
                                    />
                                    <Button variant="outline-secondary" size="sm" onClick={() => handleCancelAddNew('make')}>
                                        Cancel
                                    </Button>
                                </Stack>
                            ) : (
                                <Form.Select name="make" value={formData.make} onChange={handleDropdownChange} disabled={!formData.description}>
                                    <option value="">Select Make</option>
                                    {makeOptions.map((make, index) => (
                                        <option key={index} value={make}>
                                            {make}
                                        </option>
                                    ))}
                                    <option value={ADD_NEW_OPTION}>+ Add new...</option>
                                </Form.Select>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="model">
                            <Form.Label>Model</Form.Label>
                            {addingNew.model ? (
                                <Stack direction="horizontal" gap={2}>
                                    <Form.Control
                                        name="model"
                                        placeholder="New Model"
                                        value={formData.model}
                                        onChange={handleNewValueChange}
                                        autoFocus
                                    />
                                    <Button variant="outline-secondary" size="sm" onClick={() => handleCancelAddNew('model')}>
                                        Cancel
                                    </Button>
                                </Stack>
                            ) : (
                                <Form.Select name="model" value={formData.model} onChange={handleDropdownChange} disabled={!formData.make}>
                                    <option value="">Select Model</option>
                                    {modelOptions.map((model, index) => (
                                        <option key={index} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                    <option value={ADD_NEW_OPTION}>+ Add new...</option>
                                </Form.Select>
                            )}
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="location">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleChange}
                                list="location-options"
                            />
                            <datalist id="location-options">
                                {sourceLocations.map((loc, index) => (
                                    <option key={index} value={loc} />
                                ))}
                            </datalist>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={6} sm={12}>
                        <Form.Group controlId="size">
                            <Form.Label>Size</Form.Label>
                            {addingNew.size ? (
                                <Stack direction="horizontal" gap={2}>
                                    <Form.Control
                                        name="size"
                                        placeholder="New Size"
                                        value={formData.size}
                                        onChange={handleNewValueChange}
                                        autoFocus
                                    />
                                    <Button variant="outline-secondary" size="sm" onClick={() => handleCancelAddNew('size')}>
                                        Cancel
                                    </Button>
                                </Stack>
                            ) : (
                                <Form.Select name="size" value={formData.size} onChange={handleDropdownChange} disabled={!formData.model}>
                                    <option value="">Select Size</option>
                                    {sizeOptions.map((size, index) => (
                                        <option key={index} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                    <option value={ADD_NEW_OPTION}>+ Add new...</option>
                                </Form.Select>
                            )}
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
                            {loading ? <Spinner animation="border" variant="warning" size="sm" /> : '+'}
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
                        {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Add Stock'}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NewStock;
