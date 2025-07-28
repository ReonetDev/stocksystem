import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner,Container } from 'react-bootstrap';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axios.get('http://localhost:5260/api/devices');
                // Ensure that the response data is an array
                const devicesData = response.data.$values || response.data.items || response.data.data || response.data;
                if (Array.isArray(devicesData)) {
                    setDevices(devicesData);
                } else {
                    console.error('Fetched data is not an array:', devicesData);
                    setDevices([]); // Set to empty array to prevent crash
                }
            } catch (error) {
                console.error('Failed to fetch devices', error);
                const errorMessage = error.response?.data?.message || 'Failed to fetch devices';
                toast.error(errorMessage, { autoClose: 500 });
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
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
            <h4 className="mb-2 text-center">Devices</h4>
            <div className="d-flex justify-content-end mb-3">
                <Link to="/add-device">
                    <Button variant="primary">Add Device</Button>
                </Link>
            </div>
            <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                <Table striped bordered hover responsive className="prv-table-sm" style={{ fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(devices) && devices.map(device => (
                        <tr key={device.id}>
                            <td>{device.description}</td>
                            <td>{device.make}</td>
                            <td>{device.model}</td>
                            <td>{device.size}</td>
                            <td>
                                <Link to={`/update-device/${device.id}`}>
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

export default DeviceList;
