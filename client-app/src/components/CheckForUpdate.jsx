import React, { useState, useEffect } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';

const CheckForUpdate = () => {
    const [status, setStatus] = useState('');

    useEffect(() => {
        const removeListener = window.ipcRenderer.on('update-status', (message) => {
            setStatus(message);
        });

        return () => {
            removeListener();
        };
    }, []);

    const handleCheckForUpdate = () => {
        setStatus('Checking for updates...');
        window.ipcRenderer.send('check-for-updates');
    };

    const handleRestart = () => {
        window.ipcRenderer.send('restart-app');
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Check for Updates</h2>
            <Button onClick={handleCheckForUpdate} className="mb-3">Check for Updates</Button>
            {status && (
                <Alert variant={status.includes('Error') ? 'danger' : 'info'}>
                    {status}
                    {status.includes('Restart now?') && (
                        <Button onClick={handleRestart} variant="primary" size="sm" className="ms-2">Restart</Button>
                    )}
                </Alert>
            )}
        </Container>
    );
};

export default CheckForUpdate;
