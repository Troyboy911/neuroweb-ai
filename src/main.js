const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const BiometricProcessor = require('./modules/BiometricProcessor');
const MoodEngine = require('./modules/MoodEngine');
const AdaptiveUI = require('./modules/AdaptiveUI');
const UserProfiler = require('./modules/UserProfiler');
const LearningCore = require('./modules/LearningCore');

class NeuroWebBrowser {
  constructor() {
    this.mainWindow = null;
    this.biometricProcessor = new BiometricProcessor();
    this.moodEngine = new MoodEngine();
    this.adaptiveUI = new AdaptiveUI();
    this.userProfiler = new UserProfiler();
    this.learningCore = new LearningCore();
    
    this.initializeEventHandlers();
  }

  createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    this.mainWindow = new BrowserWindow({
      width: Math.floor(width * 0.9),
      height: Math.floor(height * 0.9),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false
      },
      icon: path.join(__dirname, '../assets/icon.png'),
      show: false
    });

    this.mainWindow.loadFile('src/renderer/index.html');
    
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      this.startBiometricMonitoring();
    });

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  initializeEventHandlers() {
    // Biometric data handlers
    ipcMain.handle('get-biometric-data', async () => {
      return await this.biometricProcessor.getCurrentData();
    });

    ipcMain.handle('get-mood-state', async () => {
      return await this.moodEngine.getCurrentMood();
    });

    // Adaptive UI handlers
    ipcMain.handle('adapt-layout', async (event, userData) => {
      return await this.adaptiveUI.adjustLayout(userData, this.mainWindow);
    });

    // User profiling handlers
    ipcMain.handle('get-user-profile', async () => {
      return await this.userProfiler.getProfile();
    });

    ipcMain.handle('update-user-behavior', async (event, behavior) => {
      return await this.userProfiler.updateBehavior(behavior);
    });

    // Learning core handlers
    ipcMain.handle('trigger-adaptation', async (event, context) => {
      return await this.learningCore.processAdaptation(context);
    });
  }

  async startBiometricMonitoring() {
    await this.biometricProcessor.initialize();
    
    // Start continuous monitoring
    setInterval(async () => {
      const biometricData = await this.biometricProcessor.getCurrentData();
      const moodState = await this.moodEngine.analyzeMood(biometricData);
      
      // Send updates to renderer
      this.mainWindow.webContents.send('biometric-update', biometricData);
      this.mainWindow.webContents.send('mood-update', moodState);
      
      // Trigger adaptations
      await this.triggerAdaptations(moodState);
    }, 1000); // Update every second
  }

  async triggerAdaptations(moodState) {
    const userProfile = await this.userProfiler.getProfile();
    const adaptations = await this.learningCore.getAdaptations(moodState, userProfile);
    
    if (adaptations.length > 0) {
      this.mainWindow.webContents.send('apply-adaptations', adaptations);
    }
  }
}

// Initialize browser
const neuroWeb = new NeuroWebBrowser();

app.whenReady().then(() => {
  neuroWeb.createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      neuroWeb.createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});