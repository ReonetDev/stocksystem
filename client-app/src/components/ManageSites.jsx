import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';

const ManageSites = () => {
    const [sites, setSites] = useState([]);
    const [clients, setClients] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentSite, setCurrentSite] = useState({
        id: 0,
        name: '',
        clientId: '',
        regionId: '',
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSites();
        fetchClients();
        fetchRegions();
    }, []);

    const fetchSites = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Sites', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSites(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch sites:', error);
            toast.error('Failed to load sites.');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Clients', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClients(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            toast.error('Failed to load clients for dropdown.');
        }
    };

    const fetchRegions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/Regions', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRegions(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch regions:', error);
            toast.error('Failed to load regions for dropdown.');
        }
    };

    const handleAddClick = () => {
        setCurrentSite({ id: 0, name: '', clientId: '', regionId: '' });
        setShowModal(true);
    };

    const handleEditClick = (site) => {
        setCurrentSite({ ...site, clientId: site.clientId, regionId: site.regionId });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentSite(prev => ({
            ...prev,
            [name]: (name === 'clientId' || name === 'regionId') ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (currentSite.id === 0) {
                // Add new site
                await axios.post('http://localhost:5260/api/Sites', currentSite, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Site added successfully!');
            } else {
                // Update existing site
                const siteToUpdate = {
                    id: currentSite.id,
                    name: currentSite.name,
                    clientId: currentSite.clientId,
                    regionId: currentSite.regionId,
                };
                await axios.put(`http://localhost:5260/api/Sites/${currentSite.id}`, siteToUpdate, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Site updated successfully!', { autoClose: 500 });
            }
            fetchSites();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save site:', error);
            toast.error('Failed to save site.', { autoClose: 500 });
        } finally {
            setLoading(false);
        }
    };

    const filteredSites = sites.filter(site => {
        return (
            site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (site.client && site.client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (site.region && site.region.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Manage Sites</h4>
            <div className="d-flex justify-content-between mb-3">
                <Form.Group controlId="search" className="flex-grow-1 me-2">
                    <Form.Control
                        type="text"
                        placeholder="Search by Name, Client, or Region"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleAddClick}>
                    Add Site
                </Button>
            </div>

            {loading ? (
                <Spinner animation="border" variant="warning" />
            ) : (
                <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Client</th>
                            <th>Region</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSites.map(site => (
                            <tr key={site.id}>
                                <td>{site.id}</td>
                                <td>{site.name}</td>
                                <td>{site.client ? site.client.name : 'N/A'}</td>
                                <td>{site.region ? site.region.name : 'N/A'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleEditClick(site)}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentSite.id === 0 ? 'Add Site' : 'Edit Site'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentSite.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Client</Form.Label>
                            <Form.Select
                                name="clientId"
                                value={currentSite.clientId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Region</Form.Label>
                            <Form.Select
                                name="regionId"
                                value={currentSite.regionId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Region</option>
                                {regions.map(region => (
                                    <option key={region.id} value={region.id}>
                                        {region.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner animation="border" variant="warning" size="sm" /> : 'Save Changes'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ManageSites;