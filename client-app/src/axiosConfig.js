import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create();

instance.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : 'N/A';
        const requestUrl = error.config?.url || '';

        // Log all errors to file
        if (window.electron && window.electron.logAxiosError) {
            window.electron.logAxiosError(`Axios Error: ${error.message} - URL: ${requestUrl} - Status: ${status}`);
        }

        // A 401 from the login request just means wrong credentials: let Login.jsx show the error.
        const isLoginRequest = requestUrl.includes('/api/users/login');

        if (status === 401 && !isLoginRequest) {
            // Token expired or invalid: drop the session but keep any "Remember me" credentials,
            // they are still valid and let the user log straight back in.
            console.log('401 Unauthorized: Token expired or invalid. Logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('role');

            // The app uses HashRouter and is loaded from file:// in production, so navigate via the
            // hash. Setting location.href to '/login' would load file:///login (a blank white page).
            if (window.location.hash !== '#/' && window.location.hash !== '') {
                toast.info('Your session has expired. Please log in again.', { toastId: 'session-expired', autoClose: 2000 });
                window.location.hash = '#/';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
