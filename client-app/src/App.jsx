import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import NewStock from './components/NewStock';
import UpdateStock from './components/UpdateStock';
import StockList from './components/StockList';
import Home from './components/Home';
import Profile from './components/Profile'; // Import the Profile component
import NavigationBar from './components/NavigationBar';
import ManageSuppliers from './components/ManageSuppliers';
import ManageUsers from './components/ManageUsers';
import CheckForUpdate from './components/CheckForUpdate';
import AllocateStock from './components/AllocateStock';
import DeliveryNote from './components/DeliveryNote';
import DeliveryNotesList from './components/DeliveryNotesList';
import Consumables from './components/Consumables';
import StockOnHand from './components/StockOnHand';
import AddSim from './components/AddSim';
import UpdateSim from './components/UpdateSim';
import AllocateSim from './components/AllocateSim';
import SimList from './components/SimList';
import SimsOnHand from './components/SimsOnHand';
import AddPRV from './components/AddPRV';
import UpdatePRV from './components/UpdatePRV';
import ForcePasswordChange from './components/ForcePasswordChange';

import PRVList from './components/PRVList';
import PRVServicing from './components/PRVServicing';
import PRVServiceRecords from './components/PRVServiceRecords';
import PRVMap from './components/PRVMap';
import ManageBusinessUnits from './components/ManageBusinessUnits';
import ManageClients from './components/ManageClients';
import ManageRegions from './components/ManageRegions';
import ManageSites from './components/ManageSites';
import ManageTechnicians from './components/ManageTechnicians';
import AddDevice from './components/AddDevice';
import UpdateDevice from './components/UpdateDevice';
import DeviceList from './components/DeviceList';
import MobileDeviceList from './components/MobileDeviceList';
import AddMobileDevice from './components/AddMobileDevice';
import UpdateMobileDevice from './components/UpdateMobileDevice';
import 'bootstrap/dist/css/bootstrap.min.css';



const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? <>{children}</> : <Navigate to="/" />;
};

const App = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        if (window.ipcRenderer) {
            window.ipcRenderer.on('theme-changed', (newTheme) => {
                // console.log('Renderer Process: Received theme:', newTheme);
                document.documentElement.setAttribute('data-bs-theme', newTheme);
                setTheme(newTheme); // Keep this to update local state for display
            });
        }
    }, []);

    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/force-password-change" element={<ForcePasswordChange />} />
                    <Route path="/home" element={<PrivateRoute><NavigationBar /><Home /></PrivateRoute>} />
                    <Route path="/stock" element={<PrivateRoute><NavigationBar /><StockList /></PrivateRoute>} />
                    <Route path="/new" element={<PrivateRoute><NavigationBar /><NewStock /></PrivateRoute>} />
                    <Route path="/update/:id" element={<PrivateRoute><NavigationBar /><UpdateStock /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><NavigationBar /><Profile /></PrivateRoute>} /> {/* Add Profile route */}
                    <Route path="/manage-suppliers" element={<PrivateRoute><NavigationBar /><ManageSuppliers /></PrivateRoute>} />
                    <Route path="/manage-users" element={<PrivateRoute><NavigationBar /><ManageUsers /></PrivateRoute>} />
                    <Route path="/check-for-update" element={<PrivateRoute><NavigationBar /><CheckForUpdate /></PrivateRoute>} />
                    <Route path="/allocate-stock" element={<PrivateRoute><NavigationBar /><AllocateStock /></PrivateRoute>} />
                    <Route path="/delivery-note/:id" element={<PrivateRoute><NavigationBar /><DeliveryNote /></PrivateRoute>} />
                    <Route path="/delivery-notes" element={<PrivateRoute><NavigationBar /><DeliveryNotesList /></PrivateRoute>} />
                    <Route path="/consumables" element={<PrivateRoute><NavigationBar /><Consumables /></PrivateRoute>} />
                    <Route path="/stock-on-hand" element={<PrivateRoute><NavigationBar /><StockOnHand /></PrivateRoute>} />
                    <Route path="/add-sim" element={<PrivateRoute><NavigationBar /><AddSim /></PrivateRoute>} />
                    <Route path="/update-sim/:id" element={<PrivateRoute><NavigationBar /><UpdateSim /></PrivateRoute>} />
                    <Route path="/allocate-sim" element={<PrivateRoute><NavigationBar /><AllocateSim /></PrivateRoute>} />
                    <Route path="/sim-list" element={<PrivateRoute><NavigationBar /><SimList /></PrivateRoute>} />
                    <Route path="/sims-on-hand" element={<PrivateRoute><NavigationBar /><SimsOnHand /></PrivateRoute>} />
                    <Route path="/add-prv" element={<PrivateRoute><NavigationBar /><AddPRV /></PrivateRoute>} />
                    <Route path="/update-prv/:id" element={<PrivateRoute><NavigationBar /><UpdatePRV /></PrivateRoute>} />
                    
                    <Route path="/prv-list" element={<PrivateRoute><NavigationBar /><PRVList /></PrivateRoute>} />
                    <Route path="/prv-servicing" element={<PrivateRoute><NavigationBar /><PRVServicing /></PrivateRoute>} />
                    <Route path="/prv-service-records" element={<PrivateRoute><NavigationBar /><PRVServiceRecords /></PrivateRoute>} />
                    <Route path="/prv-map" element={<PrivateRoute><NavigationBar /><PRVMap /></PrivateRoute>} />
                    <Route path="/manage-business-units" element={<PrivateRoute><NavigationBar /><ManageBusinessUnits /></PrivateRoute>} />
                    <Route path="/manage-clients" element={<PrivateRoute><NavigationBar /><ManageClients /></PrivateRoute>} />
                    <Route path="/manage-regions" element={<PrivateRoute><NavigationBar /><ManageRegions /></PrivateRoute>} />
                    <Route path="/manage-sites" element={<PrivateRoute><NavigationBar /><ManageSites /></PrivateRoute>} />
                    <Route path="/manage-technicians" element={<PrivateRoute><NavigationBar /><ManageTechnicians /></PrivateRoute>} />
                    <Route path="/devices" element={<PrivateRoute><NavigationBar /><DeviceList /></PrivateRoute>} />
                    <Route path="/add-device" element={<PrivateRoute><NavigationBar /><AddDevice /></PrivateRoute>} />
                    <Route path="/update-device/:id" element={<PrivateRoute><NavigationBar /><UpdateDevice /></PrivateRoute>} />
                    <Route path="/mobile-devices" element={<PrivateRoute><NavigationBar /><MobileDeviceList /></PrivateRoute>} />
                    <Route path="/add-mobile-device" element={<PrivateRoute><NavigationBar /><AddMobileDevice /></PrivateRoute>} />
                    <Route path="/update-mobile-device/:id" element={<PrivateRoute><NavigationBar /><UpdateMobileDevice /></PrivateRoute>} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;