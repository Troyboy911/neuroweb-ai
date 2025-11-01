class LearningCore {
  constructor() {
    this.mlModel = null;
    this.trainingData = [];
    this.adaptationRules = new Map();
    this.successPatterns = new Map();
    this.contextMemory = [];
    
    this.initializeMLModel();
    this.loadPretrainedRules();
  }

  async initializeMLModel() {
    // Initialize TensorFlow.js model for adaptive learning
    try {
      // This would be a more complex neural network in production
      this.mlModel = {
        predict: (input) => this.simplePredict(input),
        train: (data) => this.simpleTrain(data),
        evaluate: (data) => this.simpleEvaluate(data)
      };
      
      console.log('ML Learning Core initialized');
    } catch (error) {
      console.error('Failed to initialize ML model:', error);
      this.mlModel = this.createFallbackModel();
    }
  }

  loadPretrainedRules() {
    // Load predefined adaptation rules based on psychological research
    this.adaptationRules.set('stress_reduction', {
      conditions: { mood: 'stressed', arousal: '>0.8' },
      adaptations: [
        { type: 'visual', action: 'reduce_brightness', amount: 0.2 },
        { type: 'visual', action: 'simplify_layout' },
        { type: 'content', action: 'minimize_notifications' },
        { type: 'interaction', action: 'increase_click_area', amount: 1.3 }
      ],
      confidence: 0.8
    });

    this.adaptationRules.set('focus_enhancement', {
      conditions: { mood: 'focused', energy: '>0.7' },
      adaptations: [
        { type: 'layout', action: 'hide_sidebar' },
        { type: 'visual', action: 'increase_contrast', amount: 1.1 },
        { type: 'content', action: 'block_distractions' },
        { type: 'interaction', action: 'keyboard_shortcuts_enable' }
      ],
      confidence: 0.9
    });

    this.adaptationRules.set('mood_lifting', {
      conditions: { mood: 'sad', valence: '<0.3' },
      adaptations: [
        { type: 'visual', action: 'warm_color_temperature' },
        { type: 'content', action: 'positive_content_filter' },
        { type: 'layout', action: 'increase_spacing', amount: 1.2 },
        { type: 'interaction', action: 'gentle_animations' }
      ],
      confidence: 0.7
    });

    this.adaptationRules.set('engagement_boost', {
      conditions: { mood: 'bored', energy: '<0.3' },
      adaptations: [
        { type: 'visual', action: 'increase_brightness', amount: 1.1 },
        { type: 'content', action: 'dynamic_content' },
        { type: 'interaction', action: 'enhanced_navigation' },
        { type: 'layout', action: 'rich_toolbar' }
      ],
      confidence: 0.8
    });
  }

  async processAdaptation(context) {
    const { moodState, userProfile, currentUrl, interactions, previousAdaptations } = context;
    
    // Generate candidate adaptations
    const candidates = await this.generateCandidateAdaptations(context);
    
    // Score and rank adaptations
    const scoredAdaptations = await this.scoreAdaptations(candidates, context);
    
    // Select best adaptations
    const selectedAdaptations = this.selectOptimalAdaptations(scoredAdaptations);
    
    // Record for learning
    this.recordAdaptationAttempt(context, selectedAdaptations);
    
    return selectedAdaptations;
  }

  async generateCandidateAdaptations(context) {
    const { moodState, userProfile, interactions } = context;
    const candidates = [];

    // Rule-based adaptations
    candidates.push(...this.getRuleBasedAdaptations(moodState, userProfile));
    
    // ML-based adaptations
    candidates.push(...this.getMLBasedAdaptations(context));
    
    // Context-aware adaptations
    candidates.push(...this.getContextualAdaptations(context));
    
    // Personal history-based adaptations
    candidates.push(...this.getHistoryBasedAdaptations(context));
    
    return candidates;
  }

  getRuleBasedAdaptations(moodState, userProfile) {
    const adaptations = [];

    // Check each rule against current conditions
    this.adaptationRules.forEach((rule, ruleName) => {
      if (this.evaluateConditions(rule.conditions, moodState, userProfile)) {
        adaptations.push({
          source: 'rule',
          ruleName,
          adaptations: rule.adaptations,
          confidence: rule.confidence
        });
      }
    });

    return adaptations;
  }

  getMLBasedAdaptations(context) {
    // Use ML model to predict optimal adaptations
    const input = this.contextToFeatures(context);
    const predictions = this.mlModel.predict(input);
    
    return predictions.map(pred => ({
      source: 'ml',
      adaptations: pred.adaptations,
      confidence: pred.confidence,
      reasoning: pred.reasoning
    }));
  }

  getContextualAdaptations(context) {
    const { currentUrl, timeOfDay, deviceType } = context;
    const adaptations = [];

    // Time-based adaptations
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      adaptations.push({
        source: 'context',
        adaptations: [
          { type: 'visual', action: 'dark_mode' },
          { type: 'visual', action: 'reduce_brightness', amount: 0.8 }
        ],
        confidence: 0.9,
        reasoning: 'Night time - eye comfort'
      });
    }

    // URL-based adaptations
    if (currentUrl && currentUrl.includes('work') || currentUrl.includes('productivity')) {
      adaptations.push({
        source: 'context',
        adaptations: [
          { type: 'layout', action: 'minimal_distractions' },
          { type: 'content', action: 'focus_mode' }
        ],
        confidence: 0.8,
        reasoning: 'Work context detected'
      });
    }

    return adaptations;
  }

  getHistoryBasedAdaptations(context) {
    const adaptations = [];
    const { moodState, userProfile } = context;

    // Look for successful past adaptations in similar contexts
    const similarContexts = this.findSimilarContexts(context);
    
    similarContexts.forEach(similarContext => {
      if (similarContext.successful && similarContext.adaptations) {
        adaptations.push({
          source: 'history',
          adaptations: similarContext.adaptations,
          confidence: 0.6 + (similarContext.similarity * 0.3),
          reasoning: 'Previous success in similar context',
          reference: similarContext.id
        });
      }
    });

    return adaptations;
  }

  async scoreAdaptations(candidates, context) {
    const scored = [];

    for (const candidate of candidates) {
      const score = await this.calculateAdaptationScore(candidate, context);
      scored.push({
        ...candidate,
        overallScore: score.overall,
        detailedScores: score.breakdown
      });
    }

    return scored.sort((a, b) => b.overallScore - a.overallScore);
  }

  async calculateAdaptationScore(candidate, context) {
    const { moodState, userProfile, interactions } = context;
    
    let moodMatch = 0;
    let userMatch = 0;
    let contextMatch = 0;
    let successProbability = 0;

    // Mood alignment score
    if (candidate.source === 'rule') {
      moodMatch = this.evaluateMoodAlignment(candidate.adaptations, moodState);
    } else if (candidate.source === 'ml') {
      moodMatch = candidate.confidence || 0.5;
    } else {
      moodMatch = 0.5; // Neutral for historical/contextual
    }

    // User preference alignment
    userMatch = this.evaluateUserAlignment(candidate.adaptations, userProfile);

    // Context appropriateness
    contextMatch = this.evaluateContextAlignment(candidate, context);

    // Historical success probability
    successProbability = this.getHistoricalSuccessRate(candidate);

    const overallScore = (
      moodMatch * 0.3 +
      userMatch * 0.3 +
      contextMatch * 0.2 +
      successProbability * 0.2
    );

    return {
      overall,
      breakdown: { moodMatch, userMatch, contextMatch, successProbability }
    };
  }

  evaluateMoodAlignment(adaptations, moodState) {
    let alignment = 0.5; // Base alignment

    adaptations.forEach(adaptation => {
      switch (adaptation.type) {
        case 'visual':
          if (moodState.primaryMood === 'stressed' && adaptation.action.includes('reduce')) {
            alignment += 0.2;
          } else if (moodState.primaryMood === 'sad' && adaptation.action.includes('warm')) {
            alignment += 0.2;
          } else if (moodState.primaryMood === 'focused' && adaptation.action.includes('minimal')) {
            alignment += 0.2;
          }
          break;
        case 'content':
          if (moodState.primaryMood === 'sad' && adaptation.action.includes('positive')) {
            alignment += 0.2;
          } else if (moodState.primaryMood === 'stressed' && adaptation.action.includes('minimize')) {
            alignment += 0.2;
          }
          break;
      }
    });

    return Math.min(alignment, 1.0);
  }

  evaluateUserAlignment(adaptations, userProfile) {
    let alignment = 0.5;

    if (userProfile && userProfile.preferences) {
      adaptations.forEach(adaptation => {
        // Check against user's visual preferences
        if (userProfile.preferences.visual) {
          const visualPrefs = userProfile.preferences.visual;
          if (adaptation.type === 'visual') {
            if (visualPrefs.brightness && adaptation.action === 'reduce_brightness') {
              alignment -= 0.1; // User prefers bright
            } else if (visualPrefs.contrast && adaptation.action === 'increase_contrast') {
              alignment += 0.1; // User likes high contrast
            }
          }
        }

        // Check against personality traits
        if (userProfile.traits) {
          if (adaptation.action.includes('minimal') && userProfile.traits.openness < 0.3) {
            alignment += 0.1; // Conservative users prefer minimal
          } else if (adaptation.action.includes('dynamic') && userProfile.traits.openness > 0.7) {
            alignment += 0.1; // Open users like dynamic content
          }
        }
      });
    }

    return Math.min(alignment, 1.0);
  }

  evaluateContextAlignment(candidate, context) {
    let alignment = 0.7; // Base alignment

    const { timeOfDay, deviceType, currentUrl } = context;

    // Time-based alignment
    const hour = new Date().getHours();
    if ((hour >= 22 || hour <= 6) && candidate.adaptations.some(a => a.action === 'dark_mode')) {
      alignment += 0.2;
    }

    // Device-based alignment
    if (deviceType === 'mobile' && candidate.adaptations.some(a => 
      a.action.includes('increase_click_area') || a.action.includes('simplify'))) {
      alignment += 0.1;
    }

    // URL-based alignment
    if (currentUrl && currentUrl.includes('social') && 
        candidate.adaptations.some(a => a.action.includes('enhanced'))) {
      alignment += 0.1;
    }

    return Math.min(alignment, 1.0);
  }

  getHistoricalSuccessRate(candidate) {
    const key = this.generateAdaptationKey(candidate);
    const history = this.successPatterns.get(key);
    
    if (!history || history.attempts === 0) {
      return 0.5; // Neutral for unknown adaptations
    }

    return history.successes / history.attempts;
  }

  selectOptimalAdaptations(scoredAdaptations) {
    const selected = [];
    let totalConfidence = 0;

    // Select top adaptations while avoiding conflicts
    for (const scored of scoredAdaptations) {
      if (totalConfidence >= 0.8) break; // Stop if we're confident enough
      
      if (!this.hasConflicts(selected, scored)) {
        selected.push(scored);
        totalConfidence += scored.overallScore * 0.3; // Weight by confidence
      }
    }

    // If no good candidates, return default
    if (selected.length === 0) {
      selected.push(this.getDefaultAdaptation());
    }

    return selected;
  }

  hasConflicts(selected, candidate) {
    // Check for conflicting adaptations
    for (const existing of selected) {
      for (const existingAdapt of existing.adaptations) {
        for (const candidateAdapt of candidate.adaptations) {
          if (existingAdapt.type === candidateAdapt.type && 
              existingAdapt.action !== candidateAdapt.action &&
              this.areConflictingActions(existingAdapt.action, candidateAdapt.action)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  areConflictingActions(action1, action2) {
    const conflicts = [
      ['increase_brightness', 'reduce_brightness'],
      ['increase_contrast', 'reduce_contrast'],
      ['dark_mode', 'light_mode'],
      ['minimal_distractions', 'rich_content']
    ];

    return conflicts.some(([a, b]) => 
      (action1.includes(a) && action2.includes(b)) ||
      (action1.includes(b) && action2.includes(a))
    );
  }

  getDefaultAdaptation() {
    return {
      source: 'default',
      adaptations: [
        { type: 'visual', action: 'balance_brightness' },
        { type: 'layout', action: 'standard_layout' }
      ],
      confidence: 0.5,
      reasoning: 'Default safe adaptation'
    };
  }

  recordAdaptationAttempt(context, adaptations) {
    const record = {
      id: this.generateRecordId(),
      timestamp: Date.now(),
      context: this.sanitizeContext(context),
      adaptations: adaptations,
      outcome: null // Will be updated when feedback is received
    };

    this.contextMemory.push(record);
    
    // Keep memory manageable
    if (this.contextMemory.length > 500) {
      this.contextMemory.shift();
    }
  }

  async provideFeedback(recordId, feedback) {
    const record = this.contextMemory.find(r => r.id === recordId);
    if (!record) return;

    record.outcome = {
      feedback,
      timestamp: Date.now()
    };

    // Update success patterns
    if (feedback.positive) {
      adaptations.forEach(adaptation => {
        const key = this.generateAdaptationKey(adaptation);
        if (!this.successPatterns.has(key)) {
          this.successPatterns.set(key, { attempts: 0, successes: 0 });
        }
        const pattern = this.successPatterns.get(key);
        pattern.attempts++;
        pattern.successes++;
      });
    } else {
      adaptations.forEach(adaptation => {
        const key = this.generateAdaptationKey(adaptation);
        if (!this.successPatterns.has(key)) {
          this.successPatterns.set(key, { attempts: 0, successes: 0 });
        }
        const pattern = this.successPatterns.get(key);
        pattern.attempts++;
        // successes stays the same
      });
    }

    // Retrain ML model with new data
    await this.updateMLModel(record, feedback);
  }

  async updateMLModel(record, feedback) {
    // Convert record to training data
    const trainingExample = {
      input: this.contextToFeatures(record.context),
      output: {
        adaptations: record.adaptations,
        success: feedback.positive,
        rating: feedback.rating || 0.5
      }
    };

    this.trainingData.push(trainingExample);
    
    // Keep training data manageable
    if (this.trainingData.length > 1000) {
      this.trainingData.shift();
    }

    // Retrain model periodically
    if (this.trainingData.length % 50 === 0) {
      await this.mlModel.train(this.trainingData);
    }
  }

  contextToFeatures(context) {
    // Convert context to numerical features for ML model
    const { moodState, userProfile, timeOfDay } = context;
    
    return {
      mood_primary: this.moodToNumber(moodState.primaryMood),
      mood_energy: moodState.energy,
      mood_valence: moodState.valence,
      mood_arousal: moodState.arousal,
      user_neuroticism: userProfile.traits?.neuroticism || 0.5,
      user_extraversion: userProfile.traits?.extraversion || 0.5,
      user_openness: userProfile.traits?.openness || 0.5,
      hour: new Date().getHours() / 24,
      day_of_week: new Date().getDay() / 7
    };
  }

  moodToNumber(mood) {
    const moodMap = {
      happy: 0.8,
      sad: 0.2,
      neutral: 0.5,
      focused: 0.6,
      stressed: 0.3,
      relaxed: 0.7,
      excited: 0.9,
      bored: 0.1
    };
    return moodMap[mood] || 0.5;
  }

  generateAdaptationKey(adaptation) {
    return `${adaptation.type}_${adaptation.action}`;
  }

  generateRecordId() {
    return 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  sanitizeContext(context) {
    // Remove sensitive information from context for storage
    const { moodState, userProfile, timeOfDay, deviceType } = context;
    return {
      moodState: {
        primaryMood: moodState.primaryMood,
        energy: moodState.energy,
        valence: moodState.valence,
        arousal: moodState.arousal
      },
      userProfile: {
        traits: userProfile.traits,
        tendencies: userProfile.tendencies
      },
      timeOfDay,
      deviceType
    };
  }

  findSimilarContexts(context, threshold = 0.7) {
    const similar = [];
    const currentFeatures = this.contextToFeatures(context);

    this.contextMemory.forEach(record => {
      if (record.outcome && record.outcome.feedback) {
        const recordFeatures = this.contextToFeatures(record.context);
        const similarity = this.calculateSimilarity(currentFeatures, recordFeatures);
        
        if (similarity >= threshold) {
          similar.push({
            ...record,
            similarity
          });
        }
      }
    });

    return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  calculateSimilarity(features1, features2) {
    // Simple cosine similarity
    const keys = Object.keys(features1);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    keys.forEach(key => {
      const v1 = features1[key] || 0;
      const v2 = features2[key] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  evaluateConditions(conditions, moodState, userProfile) {
    return Object.entries(conditions).every(([key, value]) => {
      if (key === 'mood') {
        return moodState.primaryMood === value;
      } else if (key.includes('_')) {
        const [prop, operator] = key.split('_');
        const moodValue = moodState[prop];
        
        switch (operator) {
          case 'gt': return moodValue > parseFloat(value);
          case 'lt': return moodValue < parseFloat(value);
          case 'gte': return moodValue >= parseFloat(value);
          case 'lte': return moodValue <= parseFloat(value);
          default: return moodValue === parseFloat(value);
        }
      }
      return true;
    });
  }

  // Simple ML model fallbacks
  simplePredict(input) {
    // Very simple prediction logic
    return [
      {
        adaptations: [
          { type: 'visual', action: 'adjust_brightness' }
        ],
        confidence: 0.6,
        reasoning: 'Basic prediction'
      }
    ];
  }

  simpleTrain(data) {
    // Simplified training logic
    console.log(`Training with ${data.length} examples`);
  }

  simpleEvaluate(data) {
    // Simplified evaluation
    return { accuracy: 0.7, loss: 0.3 };
  }

  createFallbackModel() {
    return {
      predict: () => this.simplePredict({}),
      train: () => this.simpleTrain([]),
      evaluate: () => this.simpleEvaluate([])
    };
  }

  async getAdaptations(moodState, userProfile) {
    const context = {
      moodState,
      userProfile,
      currentUrl: window.location?.href,
      timeOfDay: new Date().getHours(),
      deviceType: 'desktop'
    };

    return await this.processAdaptation(context);
  }

  reset() {
    this.contextMemory = [];
    this.trainingData = [];
    this.successPatterns.clear();
  }
}

module.exports = LearningCore;