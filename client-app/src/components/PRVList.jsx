import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Container, Row, Col, Table, Form, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PRVList = () => {
    const [prvDevices, setPrvDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPRVDevices();
    }, []);

    const fetchPRVDevices = async () => {
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

    const handleEdit = (id) => {
        navigate(`/update-prv/${id}`);
    };

    

    const filteredPRVDevices = prvDevices.filter(prv =>
        Object.values(prv).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">PRV Device List</h2>
            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search PRV devices..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </Form.Group>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>ID</th>
                                <th>Business Unit</th>
                                <th>Client</th>
                                <th>Region</th>
                                <th>Site</th>
                                <th>Supply Description</th>
                                <th>Technician</th>
                                <th>PRV Status</th>
                                <th>PRV Size</th>
                                <th>PRV Make</th>
                                <th>Upstream Pressure</th>
                                <th>Downstream Pressure</th>
                                <th>Time Modulated Controller</th>
                                <th>Downstream Pressure Off-peak</th>
                                <th>Pilot Present</th>
                                <th>Pilot Control Mechanism</th>
                                <th>Pilot Make (Peak)</th>
                                <th>Pilot Make (Off-peak)</th>
                                <th>Advanced Controller Manufacturer</th>
                                <th>Solenoid Open</th>
                                <th>Ball Valves Present</th>
                                <th>Strainer Present</th>
                                <th>Needle Valve Present</th>
                                <th>Restrictor Present</th>
                                <th>Ball Valve on Bonnet Present</th>
                                <th>Needle Valve Turns</th>
                                <th>Needle Valve Scoured</th>
                                <th>Pilot System Flush/Bleed</th>
                                <th>Air Valve Present</th>
                                <th>Strainer Clean</th>
                                <th>Main Valve Respond to Pilot Adjustment</th>
                                <th>Leaking Fittings</th>
                                <th>Chamber Cover Present</th>
                                <th>Lock Present</th>
                                <th>Lock Working</th>
                                <th>Sufficient Working Room</th>
                                <th>Chamber Material</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Meter Size</th>
                                <th>Meter Type</th>
                                <th>Meter Manufacturer</th>
                                <th>Meter Serial No</th>
                                <th>Strainer Dirt Box</th>
                                <th>Meter Functional</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPRVDevices.map(prv => (
                                <tr key={prv.id}>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => handleEdit(prv.id)} className="me-2">Edit</Button>
                                    </td>
                                    <td>{prv.id}</td>
                                    <td>{prv.businessUnitName}</td>
                                    <td>{prv.clientName}</td>
                                    <td>{prv.regionName}</td>
                                    <td>{prv.siteName}</td>
                                    <td>{prv.supplyDescription}</td>
                                    <td>{prv.technician}</td>
                                    <td>{prv.prV_Status}</td>
                                    <td>{prv.prv_size}</td>
                                    <td>{prv.prv_make}</td>
                                    <td>{prv.upstream_pressure}</td>
                                    <td>{prv.downstream_pressure}</td>
                                    <td>{prv.time_Modulated_Controller ? 'Yes' : 'No'}</td>
                                    <td>{prv.downstream_pressure_offpeak}</td>
                                    <td>{prv.pilot_Present ? 'Yes' : 'No'}</td>
                                    <td>{prv.pilot_Control_Mechanism}</td>
                                    <td>{prv.pilot_make_peak}</td>
                                    <td>{prv.pilot_make_offpeak}</td>
                                    <td>{prv.advanced_Controller_Manufacturer}</td>
                                    <td>{prv.solenoid_Open ? 'Yes' : 'No'}</td>
                                    <td>{prv.ball_valves_present ? 'Yes' : 'No'}</td>
                                    <td>{prv.strainer_present ? 'Yes' : 'No'}</td>
                                    <td>{prv.needle_valve_present ? 'Yes' : 'No'}</td>
                                    <td>{prv.restrictor_Present ? 'Yes' : 'No'}</td>
                                    <td>{prv.ball_valve_on_bonnet_present ? 'Yes' : 'No'}</td>
                                    <td>{prv.needle_valve_turns}</td>
                                    <td>{prv.needle_valve_scoured ? 'Yes' : 'No'}</td>
                                    <td>{prv.pilot_system_flush_bleed ? 'Yes' : 'No'}</td>
                                    <td>{prv.air_Valve_present ? 'Yes' : 'No'}</td>
                                    <td>{prv.strainer_clean ? 'Yes' : 'No'}</td>
                                    <td>{prv.main_valve_respond_to_pilot_adjustment ? 'Yes' : 'No'}</td>
                                    <td>{prv.leaking_fittings ? 'Yes' : 'No'}</td>
                                    <td>{prv.chamber_Cover_present ? 'Yes' : 'No'}</td>
                                    <td>{prv.lock_present ? 'Yes' : 'No'}</td>
                                    <td>{prv.lock_working ? 'Yes' : 'No'}</td>
                                    <td>{prv.sufficient_working_Room ? 'Yes' : 'No'}</td>
                                    <td>{prv.chamber_Material}</td>
                                    <td>{prv.latitutue}</td>
                                    <td>{prv.longitute}</td>
                                    <td>{prv.meter_Size}</td>
                                    <td>{prv.meter_Type}</td>
                                    <td>{prv.meter_Manufacturer}</td>
                                    <td>{prv.meter_Serial_no}</td>
                                    <td>{prv.strainer_Dirt_Box ? 'Yes' : 'No'}</td>
                                    <td>{prv.meter_Functional ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default PRVList;
