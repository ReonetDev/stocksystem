import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Form, Button, Container, Row, Col, Spinner, Table } from 'react-bootstrap';

const AddPRV = () => {
    const initialFormData = {
        supplyDescription: '',
        technician: '',
        prv_Status: '',
        prv_Size: '',
        prv_Make: '',
        upstream_pressure: '',
        downstream_pressure: '',
        time_Modulated_Controller: false,
        downstream_pressure_offpeak: '',
        pilot_Present: false,
        pilot_Control_Mechanism: '',
        pilot_make_peak: '',
        pilot_make_offpeak: '',
        advanced_Controller_Manufacturer: '',
        solenoid_Open: false,
        ball_valves_present: false,
        strainer_present: false,
        needle_valve_present: false,
        restrictor_Present: false,
        ball_valve_on_bonnet_present: false,
        needle_valve_turns: '',
        needle_valve_scoured: false,
        pilot_system_flush_bleed: false,
        air_Valve_present: false,
        strainer_clean: false,
        main_valve_respond_to_pilot_adjustment: false,
        leaking_fittings: false,
        chamber_Cover_present: false,
        lock_present: false,
        lock_working: false,
        sufficient_working_Room: false,
        chamber_Material: '',
        latitutue: '',
        longitute: '',
        meter_Size: '',
        meter_Type: '',
        meter_Manufacturer: '',
        meter_Serial_no: '',
        transducer: '',
        strainer_Dirt_Box: false,
        meter_Functional: false,
        siteId: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [prvDevices, setPrvDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sites, setSites] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [businessUnitsList, setBusinessUnitsList] = useState([]);
    const [clientsList, setClientsList] = useState([]);
    const [regionsList, setRegionsList] = useState([]);
    const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);
    const [reoMeters, setReoMeters] = useState([]);

    const prvStatuses = ["Open", "Closed"];
    const prvMakes = ["Bermad", "Cla-Val", "Singer", "Dura-Flo", "Braukmann", "JRG", "Clayton", "Honeywell"];
    const pilotControlMechanisms = ["Altitude Pilot", "Direct Acting", "Fixed", "Dual Stage Timer"];
    const chamberMaterials = ["Concrete", "Brick", "Plastic", "Above ground ", "Concrete/Steel", "Brick/Steel"];
    const meterTypes = ["MeiStream", "Kent", "Honeywell", "WPD", "MAG Flow", "420", "H5000", "MAG", "Combination meter","Other"];
    const meterManufacturers = ["Elster", "Sensus", "Neptune", "Badger Meter", "Kamstrup", "Itron", "Zenner", "Diehl Metering", "Arad", "Master Meter", "McCrometer", "Siemens", "Honeywell", "Other"];

    const needleValveTurnsOptions = ["1 Turn", "1/2 Turn", "1/4 Turn", "3/4 Turn", "2 Turn"];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');

                const [businessUnitsRes, clientsRes, regionsRes, sitesRes, techniciansRes, reoMetersRes] = await Promise.all([
                    axios.get('http://localhost:5260/api/BusinessUnits', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5260/api/Clients', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5260/api/Regions', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5260/api/Sites', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5260/api/Technicians', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5260/api/ReoMeters', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                setBusinessUnitsList(businessUnitsRes.data.$values);
                setClientsList(clientsRes.data.$values);
                setRegionsList(regionsRes.data.$values);
                setSites(sitesRes.data.$values);
                setTechnicians(techniciansRes.data.$values);
                setReoMeters(reoMetersRes.data.$values);

            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                toast.error('Failed to load necessary data.', { autoClose: 500 });
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedBusinessUnitId) {
            const filtered = clientsList.filter(client => client.businessUnit && client.businessUnit.id === parseInt(selectedBusinessUnitId));
            setFilteredClients(filtered);
            setSelectedClientId(''); // Reset client selection
            setFormData(prev => ({ ...prev, siteId: '' })); // Reset site selection
        } else {
            setFilteredClients([]);
            setSelectedClientId('');
            setFormData(prev => ({ ...prev, siteId: '' }));
        }
    }, [selectedBusinessUnitId, clientsList]);

    useEffect(() => {
        if (selectedClientId && selectedRegionId) {
            const filtered = sites.filter(site =>
                site.client && site.client.id === parseInt(selectedClientId) &&
                site.region && site.region.id === parseInt(selectedRegionId)
            );
            setFilteredSites(filtered);
            setFormData(prev => ({ ...prev, siteId: '' })); // Reset site selection
        } else {
            setFilteredSites([]);
            setFormData(prev => ({ ...prev, siteId: '' }));
        }
    }, [selectedClientId, selectedRegionId, sites]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'siteId') {
            setFormData({ ...formData, [name]: value });
        } else if (name === 'businessUnitId') {
            setSelectedBusinessUnitId(value);
            setSelectedClientId(''); // Reset client when business unit changes
            setSelectedRegionId(''); // Reset region when business unit changes
            setFormData(prev => ({ ...prev, siteId: '' })); // Reset site
        } else if (name === 'clientId') {
            setSelectedClientId(value);
            setFormData(prev => ({ ...prev, siteId: '' })); // Reset site
        } else if (name === 'regionId') {
            setSelectedRegionId(value);
            setFormData(prev => ({ ...prev, siteId: '' })); // Reset site
        } else {
            if (name === "time_Modulated_Controller") {
                setFormData({ ...formData, [name]: value === "true" });
            } else {
                setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            toast.error('Please fill in all required fields.', { autoClose: 500 });
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            await axios.post('http://localhost:5260/api/PRVDevices', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('PRV device added successfully!', { autoClose: 500 });
            setFormData(initialFormData); // Clear form after successful submission
        } catch (error) {
            console.error('Failed to add PRV device:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add PRV device.';
            toast.error(errorMessage, { autoClose: 500 });
        }
        setLoading(false);
    };

    const isFormValid = () => {
        return (
            formData.siteId.trim() !== '' &&
            formData.technician.trim() !== '' &&
            formData.prv_Status.trim() !== '' &&
            formData.supplyDescription.trim() !== ''
        );
    };

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Add New PRV Device</h4>
            <Form className="mb-4">
                <div className="border p-3 mb-3">
                    <h4 className="mb-3">Standard Information</h4>
                    <Row className="mb-3">
                        <Col lg={4} md={6} sm={12}>
                            <Form.Group controlId="businessUnitId">
                                <Form.Label>Business Unit</Form.Label>
                                <Form.Select name="businessUnitId" value={selectedBusinessUnitId} onChange={handleChange}>
                                    <option value="">Select Business Unit</option>
                                    {businessUnitsList.map((bu) => (
                                        <option key={bu.id} value={bu.id}>{bu.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4} md={6} sm={12}>
                            <Form.Group controlId="clientId">
                                <Form.Label>Client</Form.Label>
                                <Form.Select name="clientId" value={selectedClientId} onChange={handleChange} disabled={!selectedBusinessUnitId}>
                                    <option value="">Select Client</option>
                                    {filteredClients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4} md={6} sm={12}>
                            <Form.Group controlId="regionId">
                                <Form.Label>Region</Form.Label>
                                <Form.Select name="regionId" value={selectedRegionId} onChange={handleChange}>
                                    <option value="">Select Region</option>
                                    {regionsList.map((region) => (
                                        <option key={region.id} value={region.id}>{region.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col lg={4} md={6} sm={12}>
                            <Form.Group controlId="siteId">
                                <Form.Label>Site</Form.Label>
                                <Form.Select name="siteId" value={formData.siteId} onChange={handleChange} disabled={!selectedClientId || !selectedRegionId}>
                                    <option value="">Select Site</option>
                                    {filteredSites.map((site) => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4} md={6} sm={12}>
                            <Form.Group controlId="technician">
                                <Form.Label>Technician</Form.Label>
                                <Form.Select name="technician" value={formData.technician} onChange={handleChange}>
                                    <option value="">Select Technician</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.name}>{tech.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4} md={6} sm={12}>
                            <Form.Group controlId="supplyDescription">
                                <Form.Label>Supply Description</Form.Label>
                                <Form.Control name="supplyDescription" placeholder="Supply Description" value={formData.supplyDescription} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
                <div className="border p-3 mb-3">
                    <h4 className="mb-3">Main Valve and Settings</h4>
                    <Row className="mb-3">
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="prv_Status">
                                <Form.Label>PRV Status</Form.Label>
                                <Form.Select name="prv_Status" value={formData.prv_Status} onChange={handleChange}>
                                    <option value="">Select Status</option>
                                    {prvStatuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="prv_Size">
                                <Form.Label>PRV Size</Form.Label>
                                <Form.Control type="number" name="prv_Size" placeholder="PRV Size" value={formData.prv_Size} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="prv_Make">
                                <Form.Label>PRV Make</Form.Label>
                                <Form.Select name="prv_Make" value={formData.prv_Make} onChange={handleChange}>
                                    <option value="">Select Make</option>
                                    {prvMakes.map((make) => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="upstream_pressure">
                                <Form.Label>Upstream Pressure</Form.Label>
                                <Form.Control type="number" step="0.01" name="upstream_pressure" placeholder="Upstream Pressure" value={formData.upstream_pressure} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="downstream_pressure">
                                <Form.Label>Downstream Pressure</Form.Label>
                                <Form.Control type="number" step="0.01" name="downstream_pressure" placeholder="Downstream Pressure" value={formData.downstream_pressure} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="downstream_pressure_offpeak">
                                <Form.Label>Downstream Pressure Off-peak</Form.Label>
                                <Form.Control type="number" step="0.01" name="downstream_pressure_offpeak" placeholder="Downstream Pressure Off-peak" value={formData.downstream_pressure_offpeak} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
                <div className="border p-3 mb-3">
                    <h4 className="mb-3">Controller and Pilot Information</h4>
                    <Row className="mb-3">
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="time_Modulated_Controller">
                                <Form.Label>Time Modulated Controller</Form.Label>
                                <Form.Select name="time_Modulated_Controller" value={formData.time_Modulated_Controller} onChange={handleChange}>
                                    <option value="">Select Option</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="advanced_Controller_Manufacturer">
                                <Form.Label>Advanced Controller Manufacturer</Form.Label>
                                <Form.Control name="advanced_Controller_Manufacturer" placeholder="Advanced Controller Manufacturer" value={formData.advanced_Controller_Manufacturer} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="pilot_Control_Mechanism">
                                <Form.Label>Pilot Control Mechanism</Form.Label>
                                <Form.Select name="pilot_Control_Mechanism" value={formData.pilot_Control_Mechanism} onChange={handleChange}>
                                    <option value="">Select Mechanism</option>
                                    {pilotControlMechanisms.map((mech) => (
                                        <option key={mech} value={mech}>{mech}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="pilot_make_peak">
                                <Form.Label>Pilot Make (Peak)</Form.Label>
                                <Form.Select name="pilot_make_peak" value={formData.pilot_make_peak} onChange={handleChange}>
                                    <option value="">Select Make</option>
                                    {prvMakes.map((make) => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col lg={3} md={6} sm={12}>
                            <Form.Group controlId="pilot_make_offpeak">
                                <Form.Label>Pilot Make (Off-peak)</Form.Label>
                                <Form.Select name="pilot_make_offpeak" value={formData.pilot_make_offpeak} onChange={handleChange}>
                                    <option value="">Select Make</option>
                                    {prvMakes.map((make) => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
                <div className="border p-3 mb-3">
          <h4 className="mb-3">Maintenance Status</h4>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="needle_valve_scoured">
                <Form.Check type="checkbox" name="needle_valve_scoured" label="Needle Valve Scoured" checked={formData.needle_valve_scoured} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="main_valve_respond_to_pilot_adjustment">
                <Form.Check type="checkbox" name="main_valve_respond_to_pilot_adjustment" label="Main Valve Respond to Pilot Adjust" checked={formData.main_valve_respond_to_pilot_adjustment} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="pilot_system_flush_bleed">
                <Form.Check type="checkbox" name="pilot_system_flush_bleed" label="Pilot System Flush Bleed" checked={formData.pilot_system_flush_bleed} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="leaking_fittings">
                <Form.Check type="checkbox" name="leaking_fittings" label="Leaking Fittings" checked={formData.leaking_fittings} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="strainer_clean">
                <Form.Check type="checkbox" name="strainer_clean" label="Strainer Clean" checked={formData.strainer_clean} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="sufficient_working_Room">
                <Form.Check type="checkbox" name="sufficient_working_Room" label="Sufficient Working Room" checked={formData.sufficient_working_Room} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="needle_valve_turns">
                <Form.Label>Needle Valve Turns</Form.Label>
                <Form.Select name="needle_valve_turns" value={formData.needle_valve_turns} onChange={handleChange}>
                  <option value="">Select Turns</option>
                  {needleValveTurnsOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>
        <div className="border p-3 mb-3">
          <h4 className="mb-3">Components Present</h4>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="solenoid_Open">
                <Form.Check type="checkbox" name="solenoid_Open" label="Solenoid Open" checked={formData.solenoid_Open} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="needle_valve_present">
                <Form.Check type="checkbox" name="needle_valve_present" label="Needle Valve Present" checked={formData.needle_valve_present} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="air_Valve_present">
                <Form.Check type="checkbox" name="air_Valve_present" label="Air Valve Present" checked={formData.air_Valve_present} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="lock_working">
                <Form.Check type="checkbox" name="lock_working" label="Lock Working" checked={formData.lock_working} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="ball_valves_present">
                <Form.Check type="checkbox" name="ball_valves_present" label="Ball Valves Present" checked={formData.ball_valves_present} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="restrictor_Present">
                <Form.Check type="checkbox" name="restrictor_Present" label="Restrictor Present" checked={formData.restrictor_Present} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="chamber_Cover_present">
                <Form.Check type="checkbox" name="chamber_Cover_present" label="Chamber Cover Present" checked={formData.chamber_Cover_present} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="strainer_present">
                <Form.Check type="checkbox" name="strainer_present" label="Strainer Present" checked={formData.strainer_present} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="ball_valve_on_bonnet_present">
                <Form.Check type="checkbox" name="ball_valve_on_bonnet_present" label="Ball Valve on Bonnet Present" checked={formData.ball_valve_on_bonnet_present} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="lock_present">
                <Form.Check type="checkbox" name="lock_present" label="Lock Present" checked={formData.lock_present} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="pilot_Present">
                <Form.Check type="checkbox" name="pilot_Present" label="Pilot Present" checked={formData.pilot_Present} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </div>
                <div className="border p-3 mb-3">
          <h4 className="mb-3">Chamber & Location Information</h4>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="chamber_Material">
                <Form.Label>Chamber Material</Form.Label>
                <Form.Select name="chamber_Material" value={formData.chamber_Material} onChange={handleChange}>
                  <option value="">Select Material</option>
                  {chamberMaterials.map((material) => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="latitude">
                <Form.Label>Latitude</Form.Label>
                <Form.Control name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="longitude">
                <Form.Label>Longitude</Form.Label>
                <Form.Control name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </div>
                <div className="border p-3 mb-3">
          <h4 className="mb-3">Meter Information</h4>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="meter_Size">
                <Form.Label>Meter Size</Form.Label>
                <Form.Control type="number" name="meter_Size" placeholder="Meter Size" value={formData.meter_Size} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="meter_Type">
                <Form.Label>Meter Type</Form.Label>
                <Form.Select name="meter_Type" value={formData.meter_Type} onChange={handleChange}>
                  <option value="">Select Meter Type</option>
                  {meterTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="meter_Manufacturer">
                <Form.Label>Meter Manufacturer</Form.Label>
                <Form.Select name="meter_Manufacturer" value={formData.meter_Manufacturer} onChange={handleChange}>
                  <option value="">Select Manufacturer</option>
                  {meterManufacturers.map((manufacturer) => (
                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="meter_Serial_no">
                <Form.Label>Meter Serial No</Form.Label>
                <Form.Control name="meter_Serial_no" placeholder="Meter Serial No" value={formData.meter_Serial_no} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="transducer">
                <Form.Label>Transducer</Form.Label>
                <Form.Select name="transducer" value={formData.transducer} onChange={handleChange}>
                  <option value="">Select Transducer</option>
                  {reoMeters.map((meter) => (
                    <option key={meter.reoMeterId} value={meter.meterNumber}>{meter.description} - ({meter.meterNumber})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="strainer_Dirt_Box">
                <Form.Check type="checkbox" name="strainer_Dirt_Box" label="Strainer Dirt Box" checked={formData.strainer_Dirt_Box} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Form.Group controlId="meter_Functional">
                <Form.Check type="checkbox" name="meter_Functional" label="Meter Functional" checked={formData.meter_Functional} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </div>
                <Row className="mt-3">
                <Col className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleSubmit} disabled={!isFormValid || loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Add PRV'}
                    </Button>
                </Col>
            </Row>
            </Form>
        </Container>
    );
};

export default AddPRV;
