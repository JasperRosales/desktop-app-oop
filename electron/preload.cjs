const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', {
  isDesktop: true,
  platform: process.platform,
  minimize: () => ipcRenderer.invoke('desktop:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('desktop:toggle-maximize'),
  isMaximized: () => ipcRenderer.invoke('desktop:is-maximized'),
  close: () => ipcRenderer.invoke('desktop:close'),
  reload: () => ipcRenderer.invoke('desktop:reload'),
  toggleDevTools: () => ipcRenderer.invoke('desktop:toggle-devtools'),
  printWindow: () => ipcRenderer.invoke('desktop:print'),
  saveAsPdf: () => ipcRenderer.invoke('desktop:save-pdf'),
  onMaximizedChange: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('desktop:maximized-changed', listener);
    return () => ipcRenderer.removeListener('desktop:maximized-changed', listener);
  },
});
