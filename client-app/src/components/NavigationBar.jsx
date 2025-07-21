
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/reoicon.png'; // Import the logo image
import { FaUserCircle } from 'react-icons/fa'; // Import the user icon
import { toast } from 'react-toastify';
import axios from 'axios';

const NavigationBar = () => {
    const [theme, setTheme] = useState('light');
    const [userName, setUserName] = useState(''); // State to store user's name
    const [userRole, setUserRole] = useState(localStorage.getItem('role')); // State to store user's role
    const [userModules, setUserModules] = useState(null); // State to store user's modules
    const navigate = useNavigate();

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            setTheme(mediaQuery.matches ? 'dark' : 'light');
        };

        handleChange(); // Set initial theme
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    useEffect(() => {
        const fetchUserName = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5260/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUserName(response.data.firstName); // Assuming firstName is available

                    // Fetch user modules
                    const modulesResponse = await axios.get(`http://localhost:5260/api/users/${response.data.id}/modules`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUserModules(modulesResponse.data);
                } catch (error) {
                    console.error('Failed to fetch user name', error);
                    // Optionally, handle error, e.g., log out if token is invalid
                }
            }
        };
        fetchUserName();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        toast.info('You have been logged out.');
        navigate('/');
    };

    const checkTokenValidity = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleLogout();
            return;
        }
        try {
            await axios.get('http://localhost:5260/api/users/validate-token', {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Token validation failed', error);
            toast.error('Your session has expired. Please log in again.');
            handleLogout();
        }
    };

    useEffect(() => {
        const interval = setInterval(checkTokenValidity, 10 * 60 * 1000); // Check every 10 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <Navbar bg={theme} variant={theme} expand="lg" style={{ padding: '5px 20px', borderBottom: '1px solid #dee2e6' }}>
            <Navbar.Brand as={Link} to="/home">
                <img
                    src={logo}
                    height="30"
                    className="d-inline-block align-top"
                    alt="Reonet Stock Logo"
                />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto"> {/* Use me-auto to push items to the left */}
                    {userModules && userModules.stock && (
                        <NavDropdown title="Stock" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/new">New</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/stock">Update</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/allocate-stock">Allocate</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/delivery-notes">Delivery Notes</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/consumables">Consumables</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/stock-on-hand">On Hand</NavDropdown.Item>
                        </NavDropdown>
                    )}
                    {userModules && userModules.sim && (
                        <NavDropdown title="Sim's" id="sims-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/add-sim">New</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/sim-list">Update</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/allocate-sim">Allocate</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/sims-on-hand">On Hand</NavDropdown.Item>
                        </NavDropdown>
                    )}
                    {userModules && userModules.prv && (
                        <NavDropdown title="PRV's" id="prvs-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/prv-map">Map</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/add-prv">New</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/prv-list">Update</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/prv-servicing">Servicing</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/prv-service-records">Service Records</NavDropdown.Item>
                            
                        </NavDropdown>
                    )}
                    {userModules && userModules.manage && (
                        <NavDropdown title="Manage" id="manage-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/manage-business-units">Business Units</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/manage-clients">Clients</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/manage-regions">Regions</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/manage-sites">Sites</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/manage-technicians">Technicians</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/manage-suppliers">Suppliers</NavDropdown.Item>
                        </NavDropdown>
                    )}
                    {userModules && userModules.system && (
                        <NavDropdown title="System" id="system-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/manage-users">Users</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/check-for-update">Check for Update</NavDropdown.Item>
                        </NavDropdown>
                    )}
                </Nav>
                <Nav> {/* This Nav will contain the profile icon and stay on the right */}
                    {userName && <Navbar.Text className="me-2">Hello, {userName}</Navbar.Text>} {/* Display user name */}
                    <NavDropdown title={<FaUserCircle size={25} />} id="profile-nav-dropdown" align="end"> {/* Profile Icon */}
                        <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                        <NavDropdown.Item onClick={handleLogout}>Log Off</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default NavigationBar;
