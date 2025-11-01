class AdaptiveUI {
  constructor() {
    this.adaptationHistory = [];
    this.currentLayout = {
      elementPositions: {},
      fontSize: 16,
      colorScheme: 'default',
      brightness: 1.0,
      contrast: 1.0,
      spacing: 1.0
    };
    
    this.moodBasedSettings = {
      happy: {
        brightness: 1.1,
        contrast: 1.0,
        colorTemperature: 'warm',
        animationSpeed: 0.8,
        borderRadius: 'rounded',
        spacing: 1.2
      },
      sad: {
        brightness: 0.9,
        contrast: 0.95,
        colorTemperature: 'neutral',
        animationSpeed: 0.5,
        borderRadius: 'soft',
        spacing: 1.1
      },
      stressed: {
        brightness: 0.85,
        contrast: 1.1,
        colorTemperature: 'cool',
        animationSpeed: 0.3,
        borderRadius: 'minimal',
        spacing: 0.8
      },
      focused: {
        brightness: 1.0,
        contrast: 1.05,
        colorTemperature: 'neutral',
        animationSpeed: 0.2,
        borderRadius: 'minimal',
        spacing: 0.9
      },
      relaxed: {
        brightness: 0.95,
        contrast: 0.9,
        colorTemperature: 'warm',
        animationSpeed: 1.0,
        borderRadius: 'rounded',
        spacing: 1.3
      },
      bored: {
        brightness: 1.05,
        contrast: 1.1,
        colorTemperature: 'vibrant',
        animationSpeed: 1.2,
        borderRadius: 'rounded',
        spacing: 1.0
      }
    };

    this.mistakePatterns = new Map(); // Track user mistakes for layout optimization
  }

  async adjustLayout(userData, mainWindow) {
    const { moodState, userProfile, currentUrl, interactions } = userData;
    
    const adaptations = {
      visual: this.getVisualAdaptations(moodState),
      layout: this.getLayoutAdaptations(moodState, userProfile, interactions),
      content: this.getContentAdaptations(moodState, userProfile),
      interaction: this.getInteractionAdaptations(interactions)
    };

    // Apply adaptations to the main window
    await this.applyAdaptations(adaptations, mainWindow);

    // Store adaptation for learning
    this.adaptationHistory.push({
      timestamp: Date.now(),
      moodState,
      adaptations,
      context: { currentUrl, interactions }
    });

    return adaptations;
  }

  getVisualAdaptations(moodState) {
    const moodSettings = this.moodBasedSettings[moodState.primaryMood] || this.moodBasedSettings.neutral;
    
    // Adjust visual settings based on mood
    const adaptations = {
      brightness: this.calculateOptimalBrightness(moodState),
      contrast: moodSettings.contrast,
      colorTemperature: moodSettings.colorTemperature,
      animationSpeed: moodSettings.animationSpeed,
      borderRadius: moodSettings.borderRadius,
      spacing: moodSettings.spacing,
      fontSize: this.adjustFontSize(moodState),
      colorScheme: this.getOptimalColorScheme(moodState)
    };

    // Consider time of day
    const hour = new Date().getHours();
    if (hour >= 20 || hour <= 6) {
      adaptations.brightness *= 0.8; // Reduce brightness at night
      adaptations.colorScheme = 'dark';
    }

    return adaptations;
  }

  getLayoutAdaptations(moodState, userProfile, interactions) {
    const adaptations = {
      elementRepositioning: {},
      contentPriority: [],
      navigationStyle: 'default',
      sidebarVisibility: true,
      toolbarDensity: 'normal'
    };

    // Adapt based on mood
    switch (moodState.primaryMood) {
      case 'focused':
        adaptations.sidebarVisibility = false;
        adaptations.toolbarDensity = 'minimal';
        adaptations.contentPriority = ['main', 'essential', 'secondary'];
        break;
      
      case 'stressed':
        adaptations.navigationStyle = 'simplified';
        adaptations.toolbarDensity = 'minimal';
        adaptations.elementRepositioning = this.simplifyLayout();
        break;
      
      case 'bored':
        adaptations.navigationStyle = 'enhanced';
        adaptations.toolbarDensity = 'rich';
        adaptations.contentPriority = ['engaging', 'main', 'secondary'];
        break;
      
      case 'relaxed':
        adaptations.spacing = 1.2;
        adaptations.toolbarDensity = 'comfortable';
        break;
    }

    // Adapt based on user mistakes
    if (interactions && interactions.mistakes) {
      adaptations.elementRepositioning = this.optimizeForMistakes(interactions.mistakes);
    }

    return adaptations;
  }

  getContentAdaptations(moodState, userProfile) {
    const adaptations = {
      textDensity: 'normal',
      imageSize: 'medium',
      videoAutoplay: false,
      notificationLevel: 'normal',
      contentFilter: 'none'
    };

    // Adapt content presentation based on mood
    switch (moodState.primaryMood) {
      case 'happy':
        adaptations.textDensity = 'comfortable';
        adaptations.imageSize = 'large';
        adaptations.videoAutoplay = true;
        break;
      
      case 'sad':
        adaptations.textDensity = 'light';
        adaptations.imageSize = 'small';
        adaptations.contentFilter = 'positive';
        break;
      
      case 'stressed':
        adaptations.textDensity = 'minimal';
        adaptations.imageSize = 'small';
        adaptations.notificationLevel = 'minimal';
        adaptations.contentFilter = 'calm';
        break;
      
      case 'focused':
        adaptations.textDensity = 'dense';
        adaptations.notificationLevel = 'minimal';
        adaptations.videoAutoplay = false;
        break;
    }

    // Adapt to user preferences
    if (userProfile && userProfile.contentPreferences) {
      Object.assign(adaptations, userProfile.contentPreferences);
    }

    return adaptations;
  }

  getInteractionAdaptations(interactions) {
    const adaptations = {
      clickAreaSize: 1.0,
      scrollSpeed: 1.0,
      hoverDelay: 300,
      keyboardShortcuts: true,
      gestureSupport: true
    };

    if (!interactions) return adaptations;

    // Analyze interaction patterns
    if (interactions.mistakes) {
      adaptations.clickAreaSize = this.calculateOptimalClickSize(interactions.mistakes);
    }

    if (interactions.typingSpeed) {
      adaptations.keyboardShortcuts = interactions.typingSpeed > 60;
    }

    if (interactions.scrollBehavior) {
      adaptations.scrollSpeed = this.adaptScrollSpeed(interactions.scrollBehavior);
    }

    return adaptations;
  }

  calculateOptimalBrightness(moodState) {
    let baseBrightness = 1.0;

    // Adjust based on mood energy levels
    if (moodState.energy < 0.3) {
      baseBrightness = 0.9; // Lower for low energy
    } else if (moodState.energy > 0.8) {
      baseBrightness = 1.05; // Slightly higher for high energy
    }

    // Adjust based on arousal (calm vs excited)
    if (moodState.arousal < 0.3) {
      baseBrightness *= 0.95; // Calmer settings
    } else if (moodState.arousal > 0.8) {
      baseBrightness *= 1.02; // More alert settings
    }

    return Math.min(Math.max(baseBrightness, 0.7), 1.2);
  }

  adjustFontSize(moodState) {
    let fontSize = 16; // Base font size

    // Adjust based on stress and focus
    if (moodState.primaryMood === 'stressed') {
      fontSize = 14; // Smaller for less visual noise
    } else if (moodState.primaryMood === 'sad') {
      fontSize = 18; // Larger for comfort
    } else if (moodState.primaryMood === 'focused') {
      fontSize = 15; // Slightly smaller for density
    }

    return fontSize;
  }

  getOptimalColorScheme(moodState) {
    const colorSchemes = {
      happy: 'vibrant',
      sad: 'warm_pastel',
      stressed: 'calm_blue',
      focused: 'high_contrast',
      relaxed: 'nature',
      bored: 'energetic',
      neutral: 'balanced'
    };

    return colorSchemes[moodState.primaryMood] || colorSchemes.neutral;
  }

  simplifyLayout() {
    return {
      removeElements: ['sidebars', 'popups', 'animations'],
      consolidateElements: ['toolbars', 'menus'],
      prioritizeElements: ['main_content', 'navigation']
    };
  }

  optimizeForMistakes(mistakes) {
    const elementRepositioning = {};

    // Analyze mistake patterns
    mistakes.forEach(mistake => {
      const elementId = mistake.elementId || mistake.target;
      
      if (!this.mistakePatterns.has(elementId)) {
        this.mistakePatterns.set(elementId, []);
      }
      
      this.mistakePatterns.get(elementId).push({
        timestamp: Date.now(),
        type: mistake.type, // 'missclick', 'hover', 'scroll'
        position: mistake.position
      });
    });

    // Generate repositioning suggestions
    this.mistakePatterns.forEach((pattern, elementId) => {
      if (pattern.length > 3) {
        // Element has repeated mistakes - suggest repositioning
        elementRepositioning[elementId] = this.calculateOptimalPosition(pattern);
      }
    });

    return elementRepositioning;
  }

  calculateOptimalPosition(pattern) {
    // Calculate optimal position based on mistake patterns
    const positions = pattern.map(p => p.position);
    const avgX = positions.reduce((sum, p) => sum + (p.x || 0), 0) / positions.length;
    const avgY = positions.reduce((sum, p) => sum + (p.y || 0), 0) / positions.length;

    return {
      suggestedPosition: {
        x: avgX + (Math.random() - 0.5) * 50, // Add some randomness
        y: avgY + (Math.random() - 0.5) * 50
      },
      reason: 'Repeated mistakes detected',
      confidence: Math.min(pattern.length / 10, 1.0)
    };
  }

  calculateOptimalClickSize(mistakes) {
    const missclicks = mistakes.filter(m => m.type === 'missclick');
    
    if (missclicks.length > 5) {
      return 1.3; // Increase click area by 30%
    } else if (missclicks.length > 2) {
      return 1.1; // Increase click area by 10%
    }
    
    return 1.0; // No change
  }

  adaptScrollSpeed(scrollBehavior) {
    const { velocity, acceleration } = scrollBehavior;
    
    if (velocity > 150) {
      return 1.2; // User scrolls fast - increase speed
    } else if (velocity < 50) {
      return 0.8; // User scrolls slow - decrease speed
    }
    
    return 1.0;
  }

  async applyAdaptations(adaptations, mainWindow) {
    // Send adaptations to renderer process
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('apply-ui-adaptations', adaptations);
    }
  }

  getAdaptationHistory(minutes = 30) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.adaptationHistory.filter(a => a.timestamp >= cutoff);
  }

  resetLayout() {
    this.currentLayout = {
      elementPositions: {},
      fontSize: 16,
      colorScheme: 'default',
      brightness: 1.0,
      contrast: 1.0,
      spacing: 1.0
    };
    this.mistakePatterns.clear();
  }
}

module.exports = AdaptiveUI;