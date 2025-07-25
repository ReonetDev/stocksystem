import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, ProgressBar} from 'react-bootstrap';

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
        setStatus('Checking for updates..., the system will start downloading the update if found!');
        setDownloadProgress(0);
        setIsDownloading(false);
        window.ipcRenderer.send('check-for-updates');
    };

    const handleRestart = () => {
        window.ipcRenderer.send('restart-app');
    };

    return (
        <Container fluid className="py-4">
            <h4 className="mb-4 text-center">Check server for updates!</h4>
            <div className="mt-5 text-center">
                    <Button onClick={handleCheckForUpdate} className="btn-info mb-3">Check</Button>
                    {isDownloading && <ProgressBar now={downloadProgress} label={`${downloadProgress.toFixed(2)}%`} className="mb-3" />}
                    {status && (
                        <Alert variant={status.includes('Error') ? 'danger' : 'primary'}>
                            {status}
                            {status.includes('Restart now?') && (
                                <Button onClick={handleRestart} variant="primary" size="sm" className="ms-2">Restart</Button>
                            )}
                        </Alert>
                    )}
            </div>


        </Container>
    );
};

export default CheckForUpdate;