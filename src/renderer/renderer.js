// NeuroWeb AI Browser Renderer Process
class NeuroWebRenderer {
  constructor() {
    this.biometricData = null;
    this.moodState = null;
    this.userProfile = null;
    this.adaptationHistory = [];
    this.settings = {
      enablePulse: true,
      enableTemp: true,
      enableWebcam: false,
      autoAdapt: true,
      adaptationSensitivity: 5,
      dataCollection: true,
      localStorage: true
    };
    
    this.initializeEventListeners();
    this.startPeriodicUpdates();
    this.loadSettings();
  }

  initializeEventListeners() {
    // Navigation controls
    document.getElementById('back-btn').addEventListener('click', () => this.navigateBack());
    document.getElementById('forward-btn').addEventListener('click', () => this.navigateForward());
    document.getElementById('refresh-btn').addEventListener('click', () => this.refreshPage());
    document.getElementById('search-btn').addEventListener('click', () => this.navigateOrSearch());
    
    // URL input
    const urlInput = document.getElementById('url-input');
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.navigateOrSearch();
      }
    });
    
    // Mood and biometric buttons
    document.getElementById('mood-btn').addEventListener('click', () => this.toggleMoodDetails());
    document.getElementById('biometric-btn').addEventListener('click', () => this.toggleBiometricPanel());
    document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
    
    // Panel controls
    document.getElementById('minimize-biometric').addEventListener('click', () => this.toggleBiometricPanel());
    
    // Settings modal
    document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
    document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
    document.getElementById('reset-profile').addEventListener('click', () => this.resetProfile());
    
    // Settings controls
    document.getElementById('enable-pulse').addEventListener('change', (e) => {
      this.settings.enablePulse = e.target.checked;
    });
    
    document.getElementById('enable-temp').addEventListener('change', (e) => {
      this.settings.enableTemp = e.target.checked;
    });
    
    document.getElementById('enable-webcam').addEventListener('change', (e) => {
      this.settings.enableWebcam = e.target.checked;
    });
    
    document.getElementById('auto-adapt').addEventListener('change', (e) => {
      this.settings.autoAdapt = e.target.checked;
    });
    
    document.getElementById('adaptation-sensitivity').addEventListener('input', (e) => {
      this.settings.adaptationSensitivity = parseInt(e.target.value);
      document.querySelector('.sensitivity-value').textContent = e.target.value;
    });
    
    document.getElementById('data-collection').addEventListener('change', (e) => {
      this.settings.dataCollection = e.target.checked;
    });
    
    document.getElementById('local-storage').addEventListener('change', (e) => {
      this.settings.localStorage = e.target.checked;
    });
    
    // Webview events
    const webview = document.getElementById('main-webview');
    webview.addEventListener('did-start-loading', () => this.updateStatus('Loading...'));
    webview.addEventListener('did-stop-loading', () => this.updateStatus('Ready'));
    webview.addEventListener('did-fail-load', () => this.updateStatus('Failed to load'));
    webview.addEventListener('page-title-updated', (e) => this.updateTitle(e.title));
    webview.addEventListener('page-favicon-updated', (e) => this.updateFavicon(e.favicons));
    
    // Interaction tracking
    document.addEventListener('click', (e) => this.trackClick(e));
    document.addEventListener('mousemove', (e) => this.trackMouseMove(e));
    document.addEventListener('scroll', (e) => this.trackScroll(e));
    document.addEventListener('keypress', (e) => this.trackTyping(e));
    
    // IPC communication from main process
    window.electronAPI?.onBiometricUpdate((data) => this.handleBiometricUpdate(data));
    window.electronAPI?.onMoodUpdate((data) => this.handleMoodUpdate(data));
    window.electronAPI?.onAdaptations((data) => this.handleAdaptations(data));
  }

  async startPeriodicUpdates() {
    // Request initial data
    await this.requestBiometricData();
    await this.requestMoodState();
    await this.requestUserProfile();
    
    // Set up periodic updates
    setInterval(async () => {
      if (this.settings.autoAdapt) {
        await this.analyzeAndAdapt();
      }
    }, 5000); // Check every 5 seconds
    
    setInterval(async () => {
      await this.updateBiometricDisplay();
    }, 1000); // Update display every second
  }

  async requestBiometricData() {
    try {
      const data = await window.electronAPI?.getBiometricData();
      if (data) {
        this.biometricData = data;
      }
    } catch (error) {
      console.error('Failed to get biometric data:', error);
    }
  }

  async requestMoodState() {
    try {
      const mood = await window.electronAPI?.getMoodState();
      if (mood) {
        this.moodState = mood;
      }
    } catch (error) {
      console.error('Failed to get mood state:', error);
    }
  }

  async requestUserProfile() {
    try {
      const profile = await window.electronAPI?.getUserProfile();
      if (profile) {
        this.userProfile = profile;
      }
    } catch (error) {
      console.error('Failed to get user profile:', error);
    }
  }

  async analyzeAndAdapt() {
    if (!this.moodState || !this.userProfile) return;
    
    // Track current interactions
    const interactions = this.getCurrentInteractions();
    
    // Update user behavior
    await this.updateUserBehavior(interactions);
    
    // Trigger adaptation if needed
    if (this.shouldAdapt()) {
      await this.triggerAdaptation(interactions);
    }
  }

  getCurrentInteractions() {
    return {
      clickFrequency: this.recentClicks?.length || 0,
      typingSpeed: this.calculateTypingSpeed(),
      mouseMovement: this.getMouseMovementPattern(),
      scrollBehavior: this.getScrollBehavior(),
      mistakes: this.recentMistakes || [],
      timestamp: Date.now()
    };
  }

  async updateUserBehavior(interactions) {
    try {
      const behaviorData = {
        moodState: this.moodState,
        interactions,
        currentUrl: document.getElementById('main-webview').src,
        adaptations: this.adaptationHistory.slice(-5)
      };
      
      await window.electronAPI?.updateUserBehavior(behaviorData);
    } catch (error) {
      console.error('Failed to update user behavior:', error);
    }
  }

  shouldAdapt() {
    if (!this.settings.autoAdapt) return false;
    
    // Adapt if mood changed significantly
    if (this.moodState && this.previousMoodState) {
      const moodChanged = this.moodState.primaryMood !== this.previousMoodState.primaryMood;
      const energyChanged = Math.abs(this.moodState.energy - this.previousMoodState.energy) > 0.3;
      
      if (moodChanged || energyChanged) {
        return true;
      }
    }
    
    // Adapt if user made mistakes
    if (this.recentMistakes && this.recentMistakes.length > 2) {
      return true;
    }
    
    // Adapt based on sensitivity setting
    const randomChance = Math.random() < (this.settings.adaptationSensitivity / 100);
    return randomChance;
  }

  async triggerAdaptation(interactions) {
    try {
      const context = {
        moodState: this.moodState,
        userProfile: this.userProfile,
        currentUrl: document.getElementById('main-webview').src,
        interactions,
        timeOfDay: new Date().getHours(),
        deviceType: 'desktop'
      };
      
      const adaptations = await window.electronAPI?.triggerAdaptation(context);
      if (adaptations) {
        this.applyAdaptations(adaptations);
      }
    } catch (error) {
      console.error('Failed to trigger adaptation:', error);
    }
  }

  applyAdaptations(adaptations) {
    adaptations.forEach(adaptation => {
      this.applyAdaptation(adaptation);
    });
    
    this.adaptationHistory.push({
      timestamp: Date.now(),
      adaptations,
      moodState: this.moodState
    });
    
    this.updateAdaptationDisplay();
  }

  applyAdaptation(adaptation) {
    const { adaptations } = adaptation;
    
    adaptations.forEach(adapt => {
      switch (adapt.type) {
        case 'visual':
          this.applyVisualAdaptation(adapt);
          break;
        case 'layout':
          this.applyLayoutAdaptation(adapt);
          break;
        case 'content':
          this.applyContentAdaptation(adapt);
          break;
        case 'interaction':
          this.applyInteractionAdaptation(adapt);
          break;
      }
    });
  }

  applyVisualAdaptation(adaptation) {
    const root = document.documentElement;
    
    switch (adaptation.action) {
      case 'adjust_brightness':
        root.style.setProperty('--brightness-multiplier', adaptation.amount || 1.0);
        break;
      case 'increase_brightness':
        const currentBrightness = parseFloat(root.style.getPropertyValue('--brightness-multiplier') || 1.0);
        root.style.setProperty('--brightness-multiplier', currentBrightness * (adaptation.amount || 1.1));
        break;
      case 'reduce_brightness':
        const currentBrightness2 = parseFloat(root.style.getPropertyValue('--brightness-multiplier') || 1.0);
        root.style.setProperty('--brightness-multiplier', currentBrightness2 * (adaptation.amount || 0.9));
        break;
      case 'increase_contrast':
        root.style.setProperty('--contrast-multiplier', adaptation.amount || 1.1);
        break;
      case 'dark_mode':
        document.body.classList.add('theme-dark');
        break;
      case 'light_mode':
        document.body.classList.add('theme-light');
        break;
      case 'warm_color_temperature':
        root.style.setProperty('--color-temperature', 'warm');
        break;
      case 'cool_color_temperature':
        root.style.setProperty('--color-temperature', 'cool');
        break;
    }
  }

  applyLayoutAdaptation(adaptation) {
    switch (adaptation.action) {
      case 'simplify_layout':
        document.body.classList.add('simplified');
        break;
      case 'hide_sidebar':
        this.toggleBiometricPanel(false);
        break;
      case 'increase_spacing':
        const root = document.documentElement;
        root.style.setProperty('--spacing-md', `${16 * (adaptation.amount || 1.2)}px`);
        break;
    }
  }

  applyContentAdaptation(adaptation) {
    // Content adaptations would be applied to the webview
    // This is a simplified implementation
    console.log('Content adaptation:', adaptation);
  }

  applyInteractionAdaptation(adaptation) {
    switch (adaptation.action) {
      case 'increase_click_area':
        document.querySelectorAll('button, .nav-btn, .mood-btn').forEach(btn => {
          btn.style.transform = 'scale(1.3)';
        });
        break;
      case 'gentle_animations':
        document.documentElement.style.setProperty('--transition-slow', '500ms ease');
        break;
    }
  }

  handleBiometricUpdate(data) {
    this.biometricData = data;
    this.updateBiometricDisplay();
  }

  handleMoodUpdate(data) {
    this.previousMoodState = this.moodState;
    this.moodState = data;
    this.updateMoodDisplay();
    
    // Apply mood-based theme
    this.applyMoodTheme(data.primaryMood);
  }

  handleAdaptations(adaptations) {
    this.applyAdaptations(adaptations);
  }

  updateBiometricDisplay() {
    if (!this.biometricData) return;
    
    // Update pulse
    if (this.biometricData.pulse) {
      const pulseElement = document.getElementById('pulse-value');
      pulseElement.textContent = `${Math.round(this.biometricData.pulse.bpm)} BPM`;
    }
    
    // Update temperature
    if (this.biometricData.temperature) {
      const tempElement = document.getElementById('temp-value');
      tempElement.textContent = `${this.biometricData.temperature.celsius.toFixed(1)}°C`;
    }
    
    // Update charts
    this.updateBiometricCharts();
  }

  updateMoodDisplay() {
    if (!this.moodState) return;
    
    // Update mood emoji
    const moodEmoji = document.getElementById('mood-emoji');
    const emojiMap = {
      happy: '😊',
      sad: '😢',
      neutral: '😐',
      focused: '🎯',
      stressed: '😰',
      relaxed: '😌',
      excited: '🤗',
      bored: '😴'
    };
    moodEmoji.textContent = emojiMap[this.moodState.primaryMood] || '😐';
    
    // Update mood status
    const moodStatus = document.getElementById('mood-status');
    moodStatus.textContent = `Mood: ${this.moodState.primaryMood.charAt(0).toUpperCase() + this.moodState.primaryMood.slice(1)}`;
    
    // Update mood value
    const moodValue = document.getElementById('mood-value');
    if (moodValue) {
      moodValue.textContent = this.moodState.primaryMood.charAt(0).toUpperCase() + this.moodState.primaryMood.slice(1);
    }
    
    // Update mood bars
    this.updateMoodBars();
  }

  updateMoodBars() {
    if (!this.moodState.secondaryMoods) return;
    
    const allMoods = [
      { mood: this.moodState.primaryMood, confidence: this.moodState.confidence },
      ...this.moodState.secondaryMoods
    ];
    
    // Create mood bar chart
    const moodData = {
      happy: 0, sad: 0, focused: 0, stressed: 0, relaxed: 0
    };
    
    allMoods.forEach(({ mood, confidence }) => {
      if (moodData.hasOwnProperty(mood)) {
        moodData[mood] += confidence * 100;
      }
    });
    
    // Update bar widths
    Object.entries(moodData).forEach(([mood, percentage]) => {
      const bar = document.querySelector(`.mood-bar[data-mood="${mood}"]`);
      if (bar) {
        bar.style.width = `${Math.min(percentage, 100)}%`;
      }
    });
  }

  updateBiometricCharts() {
    // Simple chart updates - in a real implementation this would use a charting library
    const pulseChart = document.getElementById('pulse-chart');
    const tempChart = document.getElementById('temp-chart');
    
    if (pulseChart && this.biometricData.pulse) {
      const normalizedPulse = (this.biometricData.pulse.bpm - 40) / 100; // Normalize 40-140 BPM to 0-1
      pulseChart.style.background = `linear-gradient(90deg, #10b981 ${normalizedPulse * 100}%, #1e293b ${normalizedPulse * 100}%)`;
    }
    
    if (tempChart && this.biometricData.temperature) {
      const normalizedTemp = (this.biometricData.temperature.celsius - 35) / 4; // Normalize 35-39°C to 0-1
      tempChart.style.background = `linear-gradient(90deg, #f59e0b ${normalizedTemp * 100}%, #1e293b ${normalizedTemp * 100}%)`;
    }
  }

  updateAdaptationDisplay() {
    const adaptationList = document.getElementById('adaptation-list');
    if (!adaptationList) return;
    
    // Clear existing items
    adaptationList.innerHTML = '';
    
    // Add recent adaptations
    const recentAdaptations = this.adaptationHistory.slice(-10).reverse();
    recentAdaptations.forEach(record => {
      const item = document.createElement('div');
      item.className = 'adaptation-item fade-in';
      
      const time = this.formatTimeAgo(record.timestamp);
      const description = this.formatAdaptationDescription(record.adaptations);
      const reason = this.getAdaptationReason(record.moodState);
      
      item.innerHTML = `
        <span class="adaptation-time">${time}</span>
        <span class="adaptation-desc">${description}</span>
        <span class="adaptation-reason">${reason}</span>
      `;
      
      adaptationList.appendChild(item);
    });
    
    // Update adaptation count
    const adaptationCount = document.getElementById('adaptation-count');
    if (adaptationCount) {
      adaptationCount.textContent = `${this.adaptationHistory.length} adaptations`;
    }
  }

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  }

  formatAdaptationDescription(adaptations) {
    if (!adaptations || adaptations.length === 0) return 'Unknown adaptation';
    
    const descriptions = adaptations.flatMap(adaptation => 
      adaptation.adaptations.map(adapt => {
        switch (adapt.action) {
          case 'increase_brightness': return 'Increased brightness';
          case 'reduce_brightness': return 'Reduced brightness';
          case 'simplify_layout': return 'Simplified layout';
          case 'hide_sidebar': return ' hid sidebar';
          case 'dark_mode': return 'Switched to dark mode';
          default: return adapt.action.replace(/_/g, ' ');
        }
      })
    );
    
    return descriptions.slice(0, 2).join(', ');
  }

  getAdaptationReason(moodState) {
    if (!moodState) return 'Adaptation applied';
    
    const reasons = {
      happy: 'Positive mood detected',
      sad: 'Low mood detected',
      stressed: 'Stress detected',
      focused: 'Focus mode detected',
      relaxed: 'Relaxed state detected',
      bored: 'Boredom detected',
      neutral: 'Neutral mood'
    };
    
    return reasons[moodState.primaryMood] || 'Mood-based adaptation';
  }

  applyMoodTheme(mood) {
    // Remove existing mood themes
    document.body.classList.remove('theme-happy', 'theme-sad', 'theme-stressed', 'theme-focused', 'theme-relaxed', 'theme-bored');
    
    // Apply new mood theme
    document.body.classList.add(`theme-${mood}`);
  }

  // Navigation methods
  navigateBack() {
    const webview = document.getElementById('main-webview');
    if (webview.canGoBack()) {
      webview.goBack();
    }
  }

  navigateForward() {
    const webview = document.getElementById('main-webview');
    if (webview.canGoForward()) {
      webview.goForward();
    }
  }

  refreshPage() {
    const webview = document.getElementById('main-webview');
    webview.reload();
  }

  navigateOrSearch() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (!url) return;
    
    const webview = document.getElementById('main-webview');
    
    if (this.isValidUrl(url)) {
      webview.src = url;
    } else {
      // Search query
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      webview.src = searchUrl;
    }
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // UI Methods
  toggleBiometricPanel(show = null) {
    const panel = document.getElementById('biometric-panel');
    const btn = document.getElementById('biometric-btn');
    
    if (show === null) {
      panel.classList.toggle('minimized');
    } else {
      if (show) {
        panel.classList.remove('minimized');
      } else {
        panel.classList.add('minimized');
      }
    }
    
    btn.classList.toggle('active', !panel.classList.contains('minimized'));
  }

  toggleMoodDetails() {
    const adaptationPanel = document.getElementById('adaptation-panel');
    adaptationPanel.classList.toggle('visible');
  }

  openSettings() {
    document.getElementById('settings-modal').classList.add('active');
  }

  closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
  }

  async saveSettings() {
    if (this.settings.localStorage) {
      localStorage.setItem('neuroweb-settings', JSON.stringify(this.settings));
    }
    
    // Send settings to main process
    try {
      await window.electronAPI?.saveSettings(this.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
    
    this.closeSettings();
  }

  async resetProfile() {
    if (confirm('Are you sure you want to reset your profile? This will clear all learned preferences and adaptations.')) {
      try {
        await window.electronAPI?.resetProfile();
        this.adaptationHistory = [];
        this.userProfile = null;
        this.updateAdaptationDisplay();
      } catch (error) {
        console.error('Failed to reset profile:', error);
      }
    }
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('neuroweb-settings');
    if (savedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        this.updateSettingsUI();
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }

  updateSettingsUI() {
    document.getElementById('enable-pulse').checked = this.settings.enablePulse;
    document.getElementById('enable-temp').checked = this.settings.enableTemp;
    document.getElementById('enable-webcam').checked = this.settings.enableWebcam;
    document.getElementById('auto-adapt').checked = this.settings.autoAdapt;
    document.getElementById('adaptation-sensitivity').value = this.settings.adaptationSensitivity;
    document.querySelector('.sensitivity-value').textContent = this.settings.adaptationSensitivity;
    document.getElementById('data-collection').checked = this.settings.dataCollection;
    document.getElementById('local-storage').checked = this.settings.localStorage;
  }

  // Status and info methods
  updateStatus(text) {
    document.getElementById('status-text').textContent = text;
  }

  updateTitle(title) {
    document.title = `${title} - NeuroWeb AI`;
  }

  updateFavicon(favicons) {
    // Update favicon if needed
  }

  // Interaction tracking
  trackClick(event) {
    if (!this.recentClicks) this.recentClicks = [];
    
    this.recentClicks.push({
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY,
      target: event.target.tagName.toLowerCase(),
      className: event.target.className
    });
    
    // Keep only recent clicks
    this.recentClicks = this.recentClicks.filter(click => Date.now() - click.timestamp < 60000);
    
    // Check for potential mistakes
    this.checkForMistake(event);
  }

  trackMouseMove(event) {
    if (!this.mouseMovements) this.mouseMovements = [];
    
    this.mouseMovements.push({
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY
    });
    
    // Keep only recent movements
    this.mouseMovements = this.mouseMovements.filter(movement => Date.now() - movement.timestamp < 5000);
  }

  trackScroll(event) {
    if (!this.scrollEvents) this.scrollEvents = [];
    
    this.scrollEvents.push({
      timestamp: Date.now(),
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX
    });
    
    // Keep only recent scrolls
    this.scrollEvents = this.scrollEvents.filter(scroll => Date.now() - scroll.timestamp < 10000);
  }

  trackTyping(event) {
    if (!this.typingEvents) this.typingEvents = [];
    
    this.typingEvents.push({
      timestamp: Date.now(),
      key: event.key,
      target: event.target.tagName.toLowerCase()
    });
    
    // Keep only recent typing
    this.typingEvents = this.typingEvents.filter(typing => Date.now() - typing.timestamp < 30000);
  }

  checkForMistake(event) {
    // Simple mistake detection - clicking rapidly in the same area
    if (this.recentClicks.length < 2) return;
    
    const lastClick = this.recentClicks[this.recentClicks.length - 2];
    const currentClick = this.recentClicks[this.recentClicks.length - 1];
    
    const timeDiff = currentClick.timestamp - lastClick.timestamp;
    const distance = Math.sqrt(
      Math.pow(currentClick.x - lastClick.x, 2) + 
      Math.pow(currentClick.y - lastClick.y, 2)
    );
    
    // If multiple clicks in same area within 500ms, might be a mistake
    if (timeDiff < 500 && distance < 50) {
      if (!this.recentMistakes) this.recentMistakes = [];
      
      this.recentMistakes.push({
        timestamp: Date.now(),
        type: 'missclick',
        elementId: event.target.id || event.target.className,
        position: { x: currentClick.x, y: currentClick.y }
      });
      
      // Keep only recent mistakes
      this.recentMistakes = this.recentMistakes.filter(mistake => Date.now() - mistake.timestamp < 300000);
    }
  }

  calculateTypingSpeed() {
    if (!this.typingEvents || this.typingEvents.length < 2) return 40; // Default WPM
    
    const timeWindow = 60000; // 1 minute
    const recentTyping = this.typingEvents.filter(event => Date.now() - event.timestamp < timeWindow);
    
    if (recentTyping.length === 0) return 40;
    
    // Simple WPM calculation (5 characters = 1 word)
    const characters = recentTyping.length;
    const minutes = timeWindow / 60000;
    return Math.round(characters / 5 / minutes);
  }

  getMouseMovementPattern() {
    if (!this.mouseMovements || this.mouseMovements.length < 2) {
      return { smoothness: 0.5, acceleration: 0.5, jitter: 0.5 };
    }
    
    // Calculate movement metrics
    let totalDistance = 0;
    let maxAcceleration = 0;
    let changes = 0;
    
    for (let i = 1; i < this.mouseMovements.length; i++) {
      const prev = this.mouseMovements[i - 1];
      const curr = this.mouseMovements[i];
      
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + 
        Math.pow(curr.y - prev.y, 2)
      );
      
      const timeDiff = curr.timestamp - prev.timestamp;
      const speed = distance / timeDiff;
      
      totalDistance += distance;
      
      if (i > 1) {
        const prevSpeed = Math.sqrt(
          Math.pow(prev.x - this.mouseMovements[i - 2].x, 2) + 
          Math.pow(prev.y - this.mouseMovements[i - 2].y, 2)
        ) / (prev.timestamp - this.mouseMovements[i - 2].timestamp);
        
        const acceleration = Math.abs(speed - prevSpeed);
        maxAcceleration = Math.max(maxAcceleration, acceleration);
        
        if (Math.abs(speed - prevSpeed) > 0.5) changes++;
      }
    }
    
    const smoothness = 1 - (changes / this.mouseMovements.length);
    const jitter = maxAcceleration / 10; // Normalize
    
    return {
      smoothness: Math.max(0, Math.min(1, smoothness)),
      acceleration: Math.max(0, Math.min(1, maxAcceleration / 5)),
      jitter: Math.max(0, Math.min(1, jitter))
    };
  }

  getScrollBehavior() {
    if (!this.scrollEvents || this.scrollEvents.length < 2) {
      return { velocity: 0, acceleration: 0, direction: 'none' };
    }
    
    const recent = this.scrollEvents.slice(-10);
    let totalScroll = 0;
    let direction = 'none';
    
    for (let i = 1; i < recent.length; i++) {
      const scrollDiff = recent[i].scrollTop - recent[i - 1].scrollTop;
      totalScroll += Math.abs(scrollDiff);
      
      if (scrollDiff !== 0) {
        direction = scrollDiff > 0 ? 'down' : 'up';
      }
    }
    
    const timeDiff = recent[recent.length - 1].timestamp - recent[0].timestamp;
    const velocity = totalScroll / timeDiff * 1000; // pixels per second
    
    return {
      velocity: Math.round(velocity),
      acceleration: 0, // Simplified
      direction
    };
  }
}

// Initialize the renderer
const neurowebRenderer = new NeuroWebRenderer();

// Expose for debugging
window.neurowebRenderer = neurowebRenderer;