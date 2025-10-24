import axios from 'axios';

const instance = axios.create();

instance.interceptors.response.use(
    response => response,
    error => {
        // Log all errors to file
        if (window.electron && window.electron.logAxiosError) {
            window.electron.logAxiosError(`Axios Error: ${error.message} - URL: ${error.config.url} - Status: ${error.response ? error.response.status : 'N/A'}`);
        }

        if (error.response && error.response.status === 401) {
            // Token expired or invalid, log out the user
            console.log('401 Unauthorized: Token expired or invalid. Logging out...');
            // Clear credentials via IPC to main process
            if (window.electron && window.electron.clearCredentials) {
                window.electron.clearCredentials();
            }
            // Navigate to the login screen
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;