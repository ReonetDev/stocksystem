import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { Container, Form, Button, Table, Modal, Spinner, Row, Col } from 'react-bootstrap';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'User', stock: false, sim: false, prv: false, manage: false, system: false, registrationCode: 'Reonet@2025' });
    const [editingUser, setEditingUser] = useState(null);
    const [modules, setModules] = useState({ stock: false, sim: false, prv: false, manage: false, system: false });
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        setCurrentUserRole(role);
        if (role === 'SysAdmin' || role === 'Admin') {
            fetchUsers();
        } else {
            toast.error('You do not have permission to view this page.', { autoClose: 1000 });
        }
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5260/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data.$values);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    const handleNewUserChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewUser({ ...newUser, [name]: type === 'checkbox' ? checked : value });
    };

    const isNewUserFormValid = () => {
        const { firstName, lastName, email, password, role } = newUser;
        return firstName.trim() !== '' &&
               lastName.trim() !== '' &&
               email.trim() !== '' &&
               password.trim() !== '' &&
               role.trim() !== '';
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5260/api/users/register', newUser);
            toast.success('User registered successfully!', { autoClose: 1000 });
            setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'User', stock: false, sim: false, prv: false, manage: false, system: false, registrationCode: '' });
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to add user:', error);
            toast.error('Failed to add user.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = async (user) => {
        setEditingUser({ ...user, password: '' }); // Don't pre-fill password
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5260/api/users/${user.id}/modules`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setModules(response.data);
        } catch (error) {
            console.error('Failed to fetch modules:', error);
            // Initialize with default false values if not found
            setModules({ stock: false, sim: false, prv: false, manage: false, system: false });
        }
        setShowEditModal(true);
    };

    const handleEditModalChange = (e) => {
        setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
    };

    const handleModuleChange = (e) => {
        setModules({ ...modules, [e.target.name]: e.target.checked });
    };

    const handleUpdateUser = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5260/api/users/${editingUser.id}`, editingUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await axios.put(`http://localhost:5260/api/users/${editingUser.id}/modules`, {
                stock: modules.stock,
                sim: modules.sim,
                prv: modules.prv,
                manage: modules.manage,
                system: modules.system
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('User updated successfully!', { autoClose: 1000 });
            setShowEditModal(false);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user.', { autoClose: 1000 });
        } finally {
            setLoading(false);
        }
    };

    if (currentUserRole !== 'SysAdmin' && currentUserRole !== 'Admin') {
        return (
            <Container fluid className="py-4">
                <h2 className="mb-4">Access Denied</h2>
                <p>You do not have the necessary permissions to view this page.</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">Manage Users</h2>
            <div style={{ border: '1px solid grey', padding: '1rem' }}>
            <Form onSubmit={handleAddUser} className="mb-4">
                <h3>Register New User</h3>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="newFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={newUser.firstName}
                                onChange={handleNewUserChange}
                                placeholder="Enter first name"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="newLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={newUser.lastName}
                                onChange={handleNewUserChange}
                                placeholder="Enter last name"
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="newEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleNewUserChange}
                                placeholder="Enter email address"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="newPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleNewUserChange}
                                placeholder="Enter password"
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="newRole">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                name="role"
                                value={newUser.role}
                                onChange={handleNewUserChange}
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="SysAdmin">SysAdmin</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <h3 className='pb-2'>Module Access</h3>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Check
                                inline
                                type="checkbox"
                                label="Stock"
                                name="stock"
                                checked={newUser.stock}
                                onChange={handleNewUserChange}
                            />
                            <Form.Check
                                inline
                                type="checkbox"
                                label="SIM"
                                name="sim"
                                checked={newUser.sim}
                                onChange={handleNewUserChange}
                            />
                            <Form.Check
                                inline
                                type="checkbox"
                                label="PRV"
                                name="prv"
                                checked={newUser.prv}
                                onChange={handleNewUserChange}
                            />
                            <Form.Check
                                inline
                                type="checkbox"
                                label="Manage"
                                name="manage"
                                checked={newUser.manage}
                                onChange={handleNewUserChange}
                            />
                            <Form.Check
                                inline
                                type="checkbox"
                                label="System"
                                name="system"
                                checked={newUser.system}
                                onChange={handleNewUserChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={12} className="d-flex justify-content-end align-items-end">
                        <Button variant="primary" type="submit" disabled={loading || !isNewUserFormValid()}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Register User'}
                        </Button>
                    </Col>
                </Row>
            </Form>
            </div>
            <h3 className="mb-3 pt-3">Existing Users</h3>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleEditClick(user)}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Edit User Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingUser && (
                        <Form>
                            <Form.Group className="mb-3" controlId="editFirstName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={editingUser.firstName}
                                    onChange={handleEditModalChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editLastName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={editingUser.lastName}
                                    onChange={handleEditModalChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={editingUser.email}
                                    onChange={handleEditModalChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editRole">
                                <Form.Label>Role</Form.Label>
                                <Form.Select
                                    name="role"
                                    value={editingUser.role}
                                    onChange={handleEditModalChange}
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                    <option value="SysAdmin">SysAdmin</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editPassword">
                                <Form.Label>New Password (optional)</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={editingUser.password}
                                    onChange={handleEditModalChange}
                                    placeholder="Leave blank to keep current password"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Modules</Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="Stock"
                                    name="stock"
                                    checked={modules.stock}
                                    onChange={handleModuleChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="SIM"
                                    name="sim"
                                    checked={modules.sim}
                                    onChange={handleModuleChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="PRV"
                                    name="prv"
                                    checked={modules.prv}
                                    onChange={handleModuleChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Manage"
                                    name="manage"
                                    checked={modules.manage}
                                    onChange={handleModuleChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="System"
                                    name="system"
                                    checked={modules.system}
                                    onChange={handleModuleChange}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdateUser} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageUsers;
