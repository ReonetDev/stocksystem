const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'electron',
    {
        clearCredentials: () => ipcRenderer.send('clear-credentials'),
        logAxiosError: (message) => ipcRenderer.send('log-axios-error', message),
    }
);

contextBridge.exposeInMainWorld(
    'ipcRenderer',
    {
        send: (channel, data) => ipcRenderer.send(channel, data),
        invoke: (channel, data) => ipcRenderer.invoke(channel, data),
        on: (channel, func) => {
            const subscription = (event, ...args) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        },
        once: (channel, func) => {
            ipcRenderer.once(channel, (event, ...args) => func(...args));
        }
    }
);

window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', (e) => {
        if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA') {
            e.preventDefault();
            ipcRenderer.send('show-context-menu');
        }
    });
});