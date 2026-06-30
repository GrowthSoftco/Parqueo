const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

app.setName('Parqueo')

// Electron es una ventana a la MISMA app servidor.
// - Producción (por defecto): carga la app desplegada en Vercel.
// - Desarrollo: pon APP_URL=http://localhost:3000 (lo hace el script electron:dev).
// Así web y escritorio comparten un solo backend y la DB nunca viaja al cliente.
const APP_URL = process.env.APP_URL || 'https://parqueoco.vercel.app'

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#000000',
    titleBarStyle: 'hidden',
    // Centrado en la columna del sidebar (inset 10px + sidebar 64px → centro ~42px)
    trafficLightPosition: { x: 16, y: 24 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadURL(APP_URL)

  // Links externos abren en el navegador del sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  // Ícono del dock en desarrollo (macOS)
  if (process.platform === 'darwin' && app.dock) {
    try {
      app.dock.setIcon(path.join(__dirname, '..', 'build', 'icon.png'))
    } catch {}
  }
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
