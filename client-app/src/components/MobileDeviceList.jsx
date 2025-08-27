import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Container } from 'react-bootstrap';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';

const MobileDeviceList = () => {
    const [mobileDevices, setMobileDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMobileDevices = async () => {
            try {
                const response = await axios.get('http://localhost:5260/api/mobiledevices');
                const devicesData = response.data.$values || response.data;
                if (Array.isArray(devicesData)) {
                    setMobileDevices(devicesData);
                } else {
                    console.error('Fetched data is not an array:', devicesData);
                    setMobileDevices([]);
                }
            } catch (error) {
                console.error('Failed to fetch mobile devices', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMobileDevices();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container fluid className="py-4 px-4">
            <h4 className="mb-2 text-center">Mobile Devices</h4>
            <div className="d-flex justify-content-end mb-3">
                <Link to="/add-mobile-device">
                    <Button variant="primary">Add Mobile Device</Button>
                </Link>
            </div>
            <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                <Table striped bordered hover responsive className="prv-table-sm" style={{ fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Type</th>
                        <th>Serial Number</th>
                        <th>IMEI</th>
                        <th>IMEI 2</th>
                        <th>Status</th>
                        <th>Allocation</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(mobileDevices) && mobileDevices.map(device => (
                        <tr key={device.id}>
                            <td>{device.make}</td>
                            <td>{device.model}</td>
                            <td>{device.type}</td>
                            <td>{device.serialNumber}</td>
                            <td>{device.imei}</td>
                            <td>{device.imei2}</td>
                            <td>{device.status}</td>
                            <td>{device.allocation}</td>
                            <td>
                                <Link to={`/update-mobile-device/${device.id}`}>
                                    <Button variant="info">Edit</Button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            </div>
        </Container>
    );
};

export default MobileDeviceList;
