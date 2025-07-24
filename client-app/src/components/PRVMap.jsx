import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Spinner, Card } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getMarkerIcon = (nextServiceDate) => {
    const now = new Date();
    const serviceDate = new Date(nextServiceDate);
    const fourMonthsFromNow = new Date();
    fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);

    let color = 'blue'; // Default color
    if (serviceDate < now) {
        color = 'red'; // Overdue
    } else if (serviceDate <= fourMonthsFromNow) {
        color = 'green'; // Due within 4 months
    }

    const markerHtmlStyles = `
        background-color: ${color};
        width: 1.5rem;
        height: 1.5rem;
        display: block;
        left: -0.75rem;
        top: -0.75rem;
        position: relative;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
    `;

    return L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles}" />`
    });
};


const PRVMap = () => {
    const [prvDevices, setPrvDevices] = useState([]);
    const [prvServices, setPrvServices] = useState([]);
    const [filteredPrvDevices, setFilteredPrvDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'businessUnit', 'client', 'region', 'site'
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [businessUnits, setBusinessUnits] = useState([]);
    const [clients, setClients] = useState([]);
    const [regions, setRegions] = useState([]);
    const [sites, setSites] = useState([]);
    const [selectedPrv, setSelectedPrv] = useState(null);

    useEffect(() => {
        fetchPrvDevices();
        fetchPrvServices();
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [selectedFilter, selectedEntityId, prvDevices, prvServices]);

    const fetchPrvDevices = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/PRVDevices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPrvDevices(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch PRV devices:', error);
            toast.error('Failed to load PRV devices.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPrvServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/PRVServices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPrvServices(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch PRV services:', error);
            toast.error('Failed to load PRV services.', { autoClose: 500 });
        }
    };

    const fetchFilterOptions = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [buRes, clientRes, regionRes, siteRes] = await Promise.all([
                axios.get('http://localhost:5260/api/BusinessUnits', { headers }),
                axios.get('http://localhost:5260/api/Clients', { headers }),
                axios.get('http://localhost:5260/api/Regions', { headers }),
                axios.get('http://localhost:5260/api/Sites', { headers }),
            ]);
            setBusinessUnits(buRes.data.$values);
            setClients(clientRes.data.$values);
            setRegions(regionRes.data.$values);
            setSites(siteRes.data.$values);
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            toast.error('Failed to load filter options.', { autoClose: 500 });
        }
    };

    const applyFilter = () => {
        let filtered = prvDevices.map(device => {
            const service = prvServices.find(s => s.prvDeviceId === device.id);
            return { ...device, nextServiceDate: service?.nextServiceDate };
        });

        if (selectedFilter === 'businessUnit' && selectedEntityId) {
            filtered = filtered.filter(prv => prv.businessUnitName === getEntityOptions().find(bu => bu.id === parseInt(selectedEntityId))?.name);
        } else if (selectedFilter === 'client' && selectedEntityId) {
            filtered = filtered.filter(prv => prv.clientName === getEntityOptions().find(client => client.id === parseInt(selectedEntityId))?.name);
        } else if (selectedFilter === 'region' && selectedEntityId) {
            filtered = filtered.filter(prv => prv.regionName === getEntityOptions().find(region => region.id === parseInt(selectedEntityId))?.name);
        } else if (selectedFilter === 'site' && selectedEntityId) {
            filtered = filtered.filter(prv => prv.siteName === getEntityOptions().find(site => site.id === parseInt(selectedEntityId))?.name);
        }
        setFilteredPrvDevices(filtered);
        setSelectedPrv(null); // Clear selected PRV on filter change
    };

    const handleFilterChange = (e) => {
        setSelectedFilter(e.target.value);
        setSelectedEntityId(''); // Reset secondary dropdown when filter type changes
    };

    const handleEntityChange = (e) => {
        setSelectedEntityId(e.target.value);
    };

    const getEntityOptions = () => {
        switch (selectedFilter) {
            case 'businessUnit':
                return businessUnits;
            case 'client':
                return clients;
            case 'region':
                return regions;
            case 'site':
                return sites;
            default:
                return [];
        }
    };

    return (
        <Container className="py-4">
            <h4 className="mb-2 text-center" >PRV Map</h4>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group controlId="filterType">
                        <Form.Label>Filter By</Form.Label>
                        <Form.Select value={selectedFilter} onChange={handleFilterChange}>
                            <option value="all">All</option>
                            <option value="businessUnit">Business Unit</option>
                            <option value="client">Client</option>
                            <option value="region">Region</option>
                            <option value="site">Site</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                {selectedFilter !== 'all' && (
                    <Col md={4}>
                        <Form.Group controlId="entitySelect">
                            <Form.Label>Select {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}</Form.Label>
                            <Form.Select value={selectedEntityId} onChange={handleEntityChange}>
                                <option value="">Select...</option>
                                {getEntityOptions().map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                )}
            </Row>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <MapContainer
                        center={[-29.0, 24.0]} // Centered on a more general South African location
                        zoom={5}
                        scrollWheelZoom={true}
                        style={{ height: '500px', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {filteredPrvDevices.map(prv => (
                            prv.latitude && prv.longitude && (
                                <Marker
                                    key={prv.id}
                                    position={[
                                        prv.latitude,
                                        prv.longitude
                                    ]}
                                    icon={getMarkerIcon(prv.nextServiceDate)}
                                    eventHandlers={{
                                        click: () => setSelectedPrv(prv),
                                    }}
                                >
                                    <Popup>
                                        <strong>{prv.supplyDescription}</strong><br/>
                                        Client: {prv.clientName}<br/>
                                        Site: {prv.siteName}<br/>
                                        Region: {prv.regionName}<br/>
                                        Business Unit: {prv.businessUnitName}<br/>
                                        Next Service: {prv.nextServiceDate ? new Date(prv.nextServiceDate).toLocaleDateString() : 'N/A'}
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>

                    {selectedPrv && (
                        <Card className="mt-3">
                            <Card.Header>PRV Details: {selectedPrv.supplyDescription}</Card.Header>
                            <Card.Body>
                                <p><strong>Client:</strong> {selectedPrv.clientName || 'N/A'}</p>
                                <p><strong>Site:</strong> {selectedPrv.siteName || 'N/A'}</p>
                                <p><strong>Region:</strong> {selectedPrv.regionName || 'N/A'}</p>
                                <p><strong>Business Unit:</strong> {selectedPrv.businessUnitName || 'N/A'}</p>
                                <p><strong>Latitude:</strong> {selectedPrv.latitude}</p>
                                <p><strong>Longitude:</strong> {selectedPrv.longitude}</p>
                                <p><strong>Next Service Date:</strong> {selectedPrv.nextServiceDate ? new Date(selectedPrv.nextServiceDate).toLocaleDateString() : 'N/A'}</p>
                                {/* Add more PRV details as needed */}
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </Container>
    );
};

export default PRVMap;
