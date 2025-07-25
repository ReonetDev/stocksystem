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


import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/dark";
import am5themes_frozen from "@amcharts/amcharts5/themes/frozen"

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
    const [reoDataLogs, setReoDataLogs] = useState([]);

    useEffect(() => {
        fetchPrvDevices();
        fetchPrvServices();
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [selectedFilter, selectedEntityId, prvDevices, prvServices]);

    useEffect(() => {
        let root;

        if (selectedPrv && selectedPrv.transducer) {
            const fetchReoDataLogs = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 7);

                    const response = await axios.get(`http://localhost:5260/api/ReoDataLogs?transducer=${selectedPrv.transducer}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setReoDataLogs(response.data.$values);

                    // Dispose of previous chart if it exists
                    if (root) {
                        root.dispose();
                    }

                    root = am5.Root.new("chartdiv");
                    root.setThemes([
                        am5themes_Animated.new(root),
                        am5themes_frozen.new(root)
                    ]);

                    let chart = root.container.children.push(am5xy.XYChart.new(root, {
                        panX: true,
                        panY: true,
                        wheelX: "panX",
                        wheelY: "zoomX",
                        pinchZoomX: true
                    }));

                    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
                    cursor.lineY.set("visible", false);

                    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
                        baseInterval: { timeUnit: "hour", count: 1 },
                        renderer: am5xy.AxisRendererX.new(root, {}),
                        tooltip: am5.Tooltip.new(root, {})
                    }));

                    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                        renderer: am5xy.AxisRendererY.new(root, {})
                    }));

                    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField: "pressure",
                        valueXField: "logDate",
                        fill: am5.color(0xff7900),
                        stroke: am5.color(0xf04a00),
                        tooltip: am5.Tooltip.new(root, {
                            labelText: "{valueY}"
                        })
                    }));

                    series.data.setAll(response.data.$values.map(item => ({
                        logDate: new Date(item.logDate).getTime(),
                        pressure: item.pressure
                    })));

                    series.appear(1000);
                    chart.appear(1000, 100);

                } catch (error) {
                    console.error('Failed to fetch ReoDataLogs:', error);
                    toast.error('Failed to load ReoDataLogs for chart.');
                }
            };
            fetchReoDataLogs();
        }

        return () => {
            if (root) {
                root.dispose();
            }
        };
    }, [selectedPrv]);

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
        <Container fluid className="py-4">
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
                    <Row>
                        <Col md={12}>
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
                                                Transducer: {prv.transducer}<br/>
                                                Next Service: {prv.nextServiceDate ? new Date(prv.nextServiceDate).toLocaleDateString() : 'N/A'}
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MapContainer>
                        </Col>
                    </Row>

                    {selectedPrv && (
                        <Row className="mt-3">
                            <Col md={4}>
                                <Card>
                                    <Card.Header>PRV Details: {selectedPrv.supplyDescription}</Card.Header>
                                    <Card.Body>
                                        <p><strong>Client:</strong> {selectedPrv.clientName || 'N/A'}</p>
                                        <p><strong>Site:</strong> {selectedPrv.siteName || 'N/A'}</p>
                                        <p><strong>Region:</strong> {selectedPrv.regionName || 'N/A'}</p>
                                        <p><strong>Business Unit:</strong> {selectedPrv.businessUnitName || 'N/A'}</p>
                                        <p><strong>Latitude:</strong> {selectedPrv.latitude}</p>
                                        <p><strong>Longitude:</strong> {selectedPrv.longitude}</p>
                                        <p><strong>Transducer:</strong> {selectedPrv.transducer}</p>
                                        <p><strong>Next Service Date:</strong> {selectedPrv.nextServiceDate ? new Date(selectedPrv.nextServiceDate).toLocaleDateString() : 'N/A'}</p>
                                        {/* Add more PRV details as needed */}
                                    </Card.Body>
                                </Card>
                            </Col>
                            {selectedPrv.transducer && (
                                <Col md={8}>
                                    <Card>
                                        <Card.Header>Transducer Data ( Last 7 days )</Card.Header>
                                        <Card.Body>
                                            <div id="chartdiv" style={{ width: "100%", height: "300px" }}></div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
};

export default PRVMap;
