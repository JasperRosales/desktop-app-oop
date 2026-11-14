const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let staticServer = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function startEmbeddedStaticServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const reqUrl = (req.url || '/').split('?')[0];
        let safePath = decodeURIComponent(reqUrl).replace(/^\/+/, '');
        if (!safePath) safePath = 'index.html';

        let filePath = path.join(distDir, safePath);
        if (!filePath.startsWith(distDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      staticServer = server;
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

async function saveCurrentViewAsPdf(win) {
  if (!win) return { canceled: true };
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save Ticket / Receipt as PDF',
    defaultPath: path.join(app.getPath('documents'), `AgriTourism-Document-${Date.now()}.pdf`),
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) return { canceled: true };

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
  });
  fs.writeFileSync(filePath, pdfData);
  return { canceled: false, filePath };
}

function buildAppMenu(win) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Print Ticket / Receipt',
          accelerator: 'CmdOrCtrl+P',
          click: () => win.webContents.print({ printBackground: true }),
        },
        {
          label: 'Save Page as PDF...',
          accelerator: 'CmdOrCtrl+S',
          click: () => saveCurrentViewAsPdf(win).catch(() => {}),
        },
        { type: 'separator' },
        {
          label: 'Reload Desktop App',
          accelerator: 'CmdOrCtrl+R',
          click: () => win.reload(),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit AgriTourism' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createDesktopWindow() {
  const distDir = path.join(__dirname, '..', 'dist');
  const devUrl = process.env.ELECTRON_START_URL;
  const startUrl = devUrl || (await startEmbeddedStaticServer(distDir));

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: true,
    autoHideMenuBar: true,
    title: 'AgriTourism Philippines',
    backgroundColor: '#FAF8F4',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  buildAppMenu(mainWindow);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('desktop:maximized-changed', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('desktop:maximized-changed', false);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('desktop:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('desktop:toggle-maximize', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    return false;
  }
  mainWindow.maximize();
  return true;
});

ipcMain.handle('desktop:is-maximized', () => {
  return Boolean(mainWindow?.isMaximized());
});

ipcMain.handle('desktop:close', () => {
  mainWindow?.close();
});

ipcMain.handle('desktop:reload', () => {
  mainWindow?.reload();
});

ipcMain.handle('desktop:toggle-devtools', () => {
  mainWindow?.webContents.toggleDevTools();
});

ipcMain.handle('desktop:save-pdf', async () => {
  return saveCurrentViewAsPdf(mainWindow);
});

ipcMain.handle('desktop:print', async () => {
  if (!mainWindow) return false;
  mainWindow.webContents.print({ printBackground: true });
  return true;
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createDesktopWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createDesktopWindow();
    }
  });

  app.on('will-quit', () => {
    if (staticServer) {
      staticServer.close();
      staticServer = null;
    }
  });
}
