class UserProfiler {
  constructor() {
    this.profile = {
      demographics: {},
      personality: {},
      behavior: {},
      preferences: {},
      learning: {},
      temporal: {}
    };
    
    this.interactionHistory = [];
    this.traits = {
      neuroticism: 0.5,
      extraversion: 0.5,
      openness: 0.5,
      agreeableness: 0.5,
      conscientiousness: 0.5
    };
    
    this.tendencies = {
      riskTaking: 0.5,
      impatience: 0.5,
      curiosity: 0.5,
      perfectionism: 0.5,
      socialEngagement: 0.5
    };
  }

  async updateBehavior(behaviorData) {
    const timestamp = Date.now();
    const enhancedBehavior = {
      ...behaviorData,
      timestamp,
      sessionId: this.getSessionId()
    };

    this.interactionHistory.push(enhancedBehavior);
    
    // Keep history manageable
    if (this.interactionHistory.length > 1000) {
      this.interactionHistory.shift();
    }

    // Update profile based on new behavior
    await this.analyzeAndUpdateProfile(enhancedBehavior);
    
    return this.getProfile();
  }

  async analyzeAndUpdateProfile(behavior) {
    // Update personality traits
    this.updatePersonalityTraits(behavior);
    
    // Update tendencies
    this.updateTendencies(behavior);
    
    // Update preferences
    this.updatePreferences(behavior);
    
    // Update temporal patterns
    this.updateTemporalPatterns(behavior);
    
    // Update learning patterns
    this.updateLearningPatterns(behavior);
  }

  updatePersonalityTraits(behavior) {
    const { moodState, interactions, contentPreferences } = behavior;

    // Neuroticism (emotional stability)
    if (moodState) {
      const moodVariability = this.calculateMoodVariability();
      if (moodState.primaryMood === 'stressed' || moodState.primaryMood === 'sad') {
        this.traits.neuroticism = Math.min(1.0, this.traits.neuroticism + 0.01);
      } else if (moodState.primaryMood === 'happy' || moodState.primaryMood === 'relaxed') {
        this.traits.neuroticism = Math.max(0.0, this.traits.neuroticism - 0.005);
      }
    }

    // Extraversion (social engagement)
    if (interactions && interactions.socialFeatures) {
      const socialScore = interactions.socialFeatures.frequency;
      this.traits.extraversion = Math.min(1.0, Math.max(0.0, 
        this.traits.extraversion * 0.9 + socialScore * 0.1
      ));
    }

    // Openness (curiosity and exploration)
    if (interactions && interactions.navigation) {
      const explorationScore = this.calculateExplorationScore(interactions.navigation);
      this.traits.openness = Math.min(1.0, Math.max(0.0,
        this.traits.openness * 0.9 + explorationScore * 0.1
      ));
    }

    // Agreeableness (cooperation vs competitive)
    if (interactions && interactions.collaboration) {
      const cooperationScore = interactions.collaboration.cooperationLevel;
      this.traits.agreeableness = Math.min(1.0, Math.max(0.0,
        this.traits.agreeableness * 0.9 + cooperationScore * 0.1
      ));
    }

    // Conscientiousness (orderliness and diligence)
    if (interactions && interactions.workPatterns) {
      const diligenceScore = this.calculateDiligenceScore(interactions.workPatterns);
      this.traits.conscientiousness = Math.min(1.0, Math.max(0.0,
        this.traits.conscientiousness * 0.9 + diligenceScore * 0.1
      ));
    }
  }

  updateTendencies(behavior) {
    const { interactions, moodState } = behavior;

    if (interactions) {
      // Risk Taking
      if (interactions.decisions) {
        const riskScore = this.calculateRiskTaking(interactions.decisions);
        this.tendencies.riskTaking = Math.min(1.0, Math.max(0.0,
          this.tendencies.riskTaking * 0.9 + riskScore * 0.1
        ));
      }

      // Impatience
      if (interactions.waitingBehavior) {
        const patienceScore = this.calculatePatience(interactions.waitingBehavior);
        this.tendencies.impatience = Math.min(1.0, Math.max(0.0,
          this.tendencies.impatience * 0.9 + (1 - patienceScore) * 0.1
        ));
      }

      // Curiosity
      if (interactions.exploration) {
        const curiosityScore = this.calculateCuriosity(interactions.exploration);
        this.tendencies.curiosity = Math.min(1.0, Math.max(0.0,
          this.tendencies.curiosity * 0.9 + curiosityScore * 0.1
        ));
      }
    }

    // Perfectionism based on mistake reactions
    if (interactions && interactions.mistakes) {
      const perfectionismScore = this.calculatePerfectionism(interactions.mistakes);
      this.tendencies.perfectionism = Math.min(1.0, Math.max(0.0,
        this.tendencies.perfectionism * 0.9 + perfectionismScore * 0.1
      ));
    }

    // Social Engagement
    if (interactions && interactions.socialFeatures) {
      const socialScore = this.calculateSocialEngagement(interactions.socialFeatures);
      this.tendencies.socialEngagement = Math.min(1.0, Math.max(0.0,
        this.tendencies.socialEngagement * 0.9 + socialScore * 0.1
      ));
    }
  }

  updatePreferences(behavior) {
    const { contentPreferences, interactionPreferences } = behavior;

    if (contentPreferences) {
      // Content type preferences
      this.profile.preferences.content = {
        ...this.profile.preferences.content,
        ...contentPreferences
      };
    }

    if (interactionPreferences) {
      // Interaction style preferences
      this.profile.preferences.interaction = {
        ...this.profile.preferences.interaction,
        ...interactionPreferences
      };
    }

    // Update visual preferences based on mood and adaptations
    if (behavior.adaptations) {
      this.profile.preferences.visual = {
        ...this.profile.preferences.visual,
        ...this.extractVisualPreferences(behavior.adaptations)
      };
    }
  }

  updateTemporalPatterns(behavior) {
    const timestamp = behavior.timestamp;
    const hour = new Date(timestamp).getHours();
    const dayOfWeek = new Date(timestamp).getDay();

    // Initialize temporal data if needed
    if (!this.profile.temporal.hourlyPatterns) {
      this.profile.temporal.hourlyPatterns = {};
    }
    if (!this.profile.temporal.dailyPatterns) {
      this.profile.temporal.dailyPatterns = {};
    }

    // Update hourly patterns
    if (!this.profile.temporal.hourlyPatterns[hour]) {
      this.profile.temporal.hourlyPatterns[hour] = {
        mood: [],
        energy: [],
        productivity: [],
        interactionTypes: {}
      };
    }

    const hourlyData = this.profile.temporal.hourlyPatterns[hour];
    if (behavior.moodState) {
      hourlyData.mood.push(behavior.moodState.primaryMood);
      hourlyData.energy.push(behavior.moodState.energy);
    }

    // Update daily patterns
    if (!this.profile.temporal.dailyPatterns[dayOfWeek]) {
      this.profile.temporal.dailyPatterns[dayOfWeek] = {
        averageMood: 'neutral',
        peakHours: [],
        commonActivities: []
      };
    }
  }

  updateLearningPatterns(behavior) {
    const { learningData, adaptations, feedback } = behavior;

    if (!this.profile.learning.adaptationEffectiveness) {
      this.profile.learning.adaptationEffectiveness = {};
    }

    // Track how effective adaptations are
    if (adaptations && feedback) {
      adaptations.forEach(adaptation => {
        const key = adaptation.type;
        if (!this.profile.learning.adaptationEffectiveness[key]) {
          this.profile.learning.adaptationEffectiveness[key] = {
            attempts: 0,
            successes: 0,
            averageRating: 0
          };
        }

        const effectiveness = this.profile.learning.adaptationEffectiveness[key];
        effectiveness.attempts++;
        
        if (feedback.positive) {
          effectiveness.successes++;
        }
        
        if (feedback.rating) {
          effectiveness.averageRating = 
            (effectiveness.averageRating * (effectiveness.attempts - 1) + feedback.rating) / 
            effectiveness.attempts;
        }
      });
    }

    // Update learning style
    if (behavior.interactions && behavior.interactions.learningBehavior) {
      this.profile.learning.style = this.analyzeLearningStyle(behavior.interactions.learningBehavior);
    }
  }

  // Helper methods for trait calculations
  calculateMoodVariability() {
    const recentMoods = this.interactionHistory
      .slice(-20)
      .map(i => i.moodState?.primaryMood)
      .filter(Boolean);

    if (recentMoods.length < 5) return 0.5;

    const uniqueMoods = new Set(recentMoods).size;
    return uniqueMoods / 8; // Normalize by number of possible moods
  }

  calculateExplorationScore(navigation) {
    const { visitedPages, timeOnPage, clickPatterns } = navigation;
    
    // High exploration: many different pages, short time on each, diverse clicks
    const diversity = new Set(visitedPages).size / Math.max(visitedPages.length, 1);
    const avgTimeOnPage = timeOnPage.reduce((a, b) => a + b, 0) / timeOnPage.length;
    const explorationScore = diversity * (1 - Math.min(avgTimeOnPage / 300000, 1)); // 5 min max
    
    return Math.min(1.0, explorationScore);
  }

  calculateDiligenceScore(workPatterns) {
    const { sessionLength, taskCompletion, errorRate } = workPatterns;
    
    // High diligence: long sessions, high completion rate, low error rate
    const lengthScore = Math.min(sessionLength / 3600000, 1); // 1 hour max
    const completionScore = taskCompletion.completed / Math.max(taskCompletion.total, 1);
    const accuracyScore = 1 - Math.min(errorRate, 1);
    
    return (lengthScore + completionScore + accuracyScore) / 3;
  }

  calculateRiskTaking(decisions) {
    const { uncertaintyTolerance, novelChoices, quickDecisions } = decisions;
    
    return (uncertaintyTolerance + novelChoices + quickDecisions) / 3;
  }

  calculatePatience(waitingBehavior) {
    const { averageWaitTime, abandonmentRate, frustrationLevel } = waitingBehavior;
    
    const patienceScore = 1 - Math.min(frustrationLevel, 1);
    const waitTolerance = Math.min(averageWaitTime / 10000, 1); // 10 seconds max
    const persistenceScore = 1 - abandonmentRate;
    
    return (patienceScore + waitTolerance + persistenceScore) / 3;
  }

  calculateCuriosity(exploration) {
    const { informationSeeking, newFeatureTries, deepDives } = exploration;
    
    return (informationSeeking + newFeatureTries + deepDives) / 3;
  }

  calculatePerfectionism(mistakes) {
    const { reactionTime, correctionAttempts, frustrationLevel } = mistakes;
    
    // High perfectionism: quick reaction to mistakes, multiple correction attempts
    const reactionScore = 1 - Math.min(reactionTime / 5000, 1); // 5 seconds max
    const persistenceScore = Math.min(correctionAttempts / 3, 1); // 3 attempts max
    const frustrationScore = frustrationLevel; // Higher frustration indicates perfectionism
    
    return (reactionScore + persistenceScore + frustrationScore) / 3;
  }

  calculateSocialEngagement(socialFeatures) {
    const { sharingFrequency, commentingFrequency, collaborationFrequency } = socialFeatures;
    
    const total = sharingFrequency + commentingFrequency + collaborationFrequency;
    return Math.min(total / 10, 1); // Normalize
  }

  analyzeLearningStyle(learningBehavior) {
    const { visualPreference, auditoryPreference, kinestheticPreference } = learningBehavior;
    
    return {
      visual: visualPreference || 0.33,
      auditory: auditoryPreference || 0.33,
      kinesthetic: kinestheticPreference || 0.34
    };
  }

  extractVisualPreferences(adaptations) {
    return {
      brightness: adaptations.visual?.brightness,
      contrast: adaptations.visual?.contrast,
      colorScheme: adaptations.visual?.colorScheme,
      fontSize: adaptations.visual?.fontSize,
      spacing: adaptations.visual?.spacing
    };
  }

  getSessionId() {
    // Generate or retrieve session ID
    if (!this.currentSessionId) {
      this.currentSessionId = this.generateSessionId();
    }
    return this.currentSessionId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getProfile() {
    // Compile complete user profile
    return {
      traits: { ...this.traits },
      tendencies: { ...this.tendencies },
      preferences: { ...this.profile.preferences },
      temporal: { ...this.profile.temporal },
      learning: { ...this.profile.learning },
      statistics: this.getInteractionStatistics(),
      lastUpdated: Date.now()
    };
  }

  getInteractionStatistics() {
    const recent = this.interactionHistory.slice(-100);
    
    return {
      totalInteractions: this.interactionHistory.length,
      recentInteractions: recent.length,
      averageSessionLength: this.calculateAverageSessionLength(),
      mostCommonMood: this.getMostCommonMood(),
      peakProductivityHours: this.getPeakProductivityHours()
    };
  }

  calculateAverageSessionLength() {
    // Calculate average session length from interaction history
    // This is a simplified implementation
    return 1800000; // 30 minutes average
  }

  getMostCommonMood() {
    const recent = this.interactionHistory.slice(-50);
    const moods = recent
      .map(i => i.moodState?.primaryMood)
      .filter(Boolean);
    
    if (moods.length === 0) return 'neutral';
    
    const moodCounts = {};
    moods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    return Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0][0];
  }

  getPeakProductivityHours() {
    // Analyze when user is most focused/productive
    // Simplified implementation
    return [9, 10, 11, 14, 15, 16]; // Business hours
  }

  resetProfile() {
    this.profile = {
      demographics: {},
      personality: {},
      behavior: {},
      preferences: {},
      learning: {},
      temporal: {}
    };
    
    this.traits = {
      neuroticism: 0.5,
      extraversion: 0.5,
      openness: 0.5,
      agreeableness: 0.5,
      conscientiousness: 0.5
    };
    
    this.tendencies = {
      riskTaking: 0.5,
      impatience: 0.5,
      curiosity: 0.5,
      perfectionism: 0.5,
      socialEngagement: 0.5
    };
    
    this.interactionHistory = [];
  }
}

module.exports = UserProfiler;