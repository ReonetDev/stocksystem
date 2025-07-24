import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, ProgressBar } from 'react-bootstrap';

const CheckForUpdate = () => {
    const [status, setStatus] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const removeStatusListener = window.ipcRenderer.on('update-status', (message) => {
            setStatus(message);
            if (message === 'Update available.') {
                setIsDownloading(true);
            }
            if (message.includes('Update downloaded') || message.includes('Error')) {
                setIsDownloading(false);
            }
        });

        const removeProgressListener = window.ipcRenderer.on('download-progress', (progress) => {
            setDownloadProgress(progress);
        });

        return () => {
            removeStatusListener();
            removeProgressListener();
        };
    }, []);

    const handleCheckForUpdate = () => {
        setStatus('Checking for updates...');
        setDownloadProgress(0);
        setIsDownloading(false);
        window.ipcRenderer.send('check-for-updates');
    };

    const handleRestart = () => {
        window.ipcRenderer.send('restart-app');
    };

    return (
        <Container fluid className="py-4">
            <h4 className="mb-2 text-center">Check for Updates</h4>
            <Button onClick={handleCheckForUpdate} className="mb-3">Check for Updates</Button>
            {isDownloading && <ProgressBar now={downloadProgress} label={`${downloadProgress.toFixed(2)}%`} className="mb-3" />}
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