class MoodEngine {
  constructor() {
    this.moodHistory = [];
    this.emotionWeights = {
      happy: { energy: 0.8, valence: 0.9, arousal: 0.7 },
      sad: { energy: 0.2, valence: 0.1, arousal: 0.3 },
      neutral: { energy: 0.5, valence: 0.5, arousal: 0.5 },
      focused: { energy: 0.6, valence: 0.6, arousal: 0.4 },
      stressed: { energy: 0.9, valence: 0.2, arousal: 0.9 },
      relaxed: { energy: 0.3, valence: 0.7, arousal: 0.2 },
      excited: { energy: 0.95, valence: 0.85, arousal: 0.9 },
      bored: { energy: 0.1, valence: 0.3, arousal: 0.1 }
    };
    
    this.biometricThresholds = {
      pulse: {
        resting: { min: 60, max: 80 },
        elevated: { min: 80, max: 100 },
        high: { min: 100, max: 140 }
      },
      temperature: {
        normal: { min: 36.0, max: 37.0 },
        elevated: { min: 37.0, max: 37.5 },
        high: { min: 37.5, max: 38.5 }
      }
    };
  }

  async analyzeMood(biometricData) {
    const moodAnalysis = {
      primaryMood: 'neutral',
      confidence: 0,
      energy: 0.5,
      valence: 0.5, // positive vs negative
      arousal: 0.5, // calm vs excited
      secondaryMoods: [],
      biometricIndicators: {},
      timestamp: Date.now()
    };

    // Analyze biometric indicators
    const pulseAnalysis = this.analyzePulse(biometricData.pulse);
    const temperatureAnalysis = this.analyzeTemperature(biometricData.temperature);
    const interactionAnalysis = this.analyzeInteractions(biometricData.interactionPatterns);
    const facialAnalysis = this.analyzeFacialExpression(biometricData.facialExpression);

    moodAnalysis.biometricIndicators = {
      pulse: pulseAnalysis,
      temperature: temperatureAnalysis,
      interactions: interactionAnalysis,
      facial: facialAnalysis
    };

    // Combine analyses to determine mood
    const combinedMood = this.combineAnalyses(
      pulseAnalysis,
      temperatureAnalysis, 
      interactionAnalysis,
      facialAnalysis
    );

    Object.assign(moodAnalysis, combinedMood);

    // Store in history
    this.moodHistory.push(moodAnalysis);
    if (this.moodHistory.length > 200) {
      this.moodHistory.shift();
    }

    return moodAnalysis;
  }

  analyzePulse(pulseData) {
    if (!pulseData) return { mood: 'neutral', confidence: 0 };

    const { bpm, variability, confidence } = pulseData;
    let mood = 'neutral';
    let energy = 0.5;
    let arousal = 0.5;

    // Determine energy level from BPM
    if (bpm < this.biometricThresholds.pulse.resting.max) {
      mood = 'relaxed';
      energy = 0.3;
      arousal = 0.2;
    } else if (bpm < this.biometricThresholds.pulse.elevated.max) {
      mood = 'focused';
      energy = 0.6;
      arousal = 0.4;
    } else {
      // High pulse could indicate stress or excitement
      if (variability > 15) {
        mood = 'stressed';
        arousal = 0.9;
      } else {
        mood = 'excited';
        arousal = 0.8;
      }
      energy = 0.8;
    }

    return {
      mood,
      confidence: confidence * 0.8, // Adjust for biometric reliability
      energy,
      arousal,
      bpm
    };
  }

  analyzeTemperature(temperatureData) {
    if (!temperatureData) return { mood: 'neutral', confidence: 0 };

    const { celsius, trend, confidence } = temperatureData;
    let mood = 'neutral';
    let valence = 0.5;

    // Temperature analysis for mood
    if (celsius < this.biometricThresholds.temperature.normal.min) {
      mood = 'sad';
      valence = 0.2;
    } else if (celsius > this.biometricThresholds.temperature.elevated.min) {
      mood = 'stressed';
      valence = 0.3;
    } else {
      mood = 'neutral';
      valence = 0.6;
    }

    // Consider trend
    if (trend === 'rising' && celsius > 37.0) {
      mood = 'stressed';
      valence = 0.2;
    } else if (trend === 'falling' && mood === 'stressed') {
      mood = 'relaxed';
      valence = 0.7;
    }

    return {
      mood,
      confidence: confidence * 0.6,
      valence,
      temperature: celsius,
      trend
    };
  }

  analyzeInteractions(interactionPatterns) {
    if (!interactionPatterns) return { mood: 'neutral', confidence: 0 };

    const { clickFrequency, typingSpeed, mouseMovement, scrollBehavior } = interactionPatterns;
    
    let mood = 'neutral';
    let energy = 0.5;
    let arousal = 0.5;

    // Analyze click patterns
    if (clickFrequency > 8) {
      // High clicking could indicate frustration or excitement
      if (mouseMovement.jitter > 0.7) {
        mood = 'stressed';
        arousal = 0.9;
      } else {
        mood = 'excited';
        arousal = 0.8;
      }
      energy = 0.8;
    } else if (clickFrequency < 2) {
      mood = 'bored';
      energy = 0.1;
      arousal = 0.1;
    }

    // Analyze typing speed
    if (typingSpeed > 80) {
      mood = mood === 'stressed' ? 'stressed' : 'focused';
      energy = 0.7;
    } else if (typingSpeed < 30) {
      mood = mood === 'bored' ? 'bored' : 'relaxed';
      energy = 0.3;
    }

    // Analyze mouse movement smoothness
    if (mouseMovement.smoothness < 0.3) {
      if (mood !== 'stressed') {
        mood = 'focused'; // Could be precise work
      }
    }

    return {
      mood,
      confidence: 0.7,
      energy,
      arousal,
      patterns: {
        clickFrequency,
        typingSpeed,
        mouseSmoothness: mouseMovement.smoothness,
        scrollVelocity: scrollBehavior.velocity
      }
    };
  }

  analyzeFacialExpression(facialData) {
    if (!facialData) return { mood: 'neutral', confidence: 0 };

    const { emotion, confidence } = facialData;
    
    // Map facial emotions to our mood system
    const emotionMapping = {
      happy: { mood: 'happy', valence: 0.9, energy: 0.7, arousal: 0.6 },
      sad: { mood: 'sad', valence: 0.1, energy: 0.2, arousal: 0.3 },
      neutral: { mood: 'neutral', valence: 0.5, energy: 0.5, arousal: 0.5 },
      focused: { mood: 'focused', valence: 0.6, energy: 0.6, arousal: 0.4 },
      stressed: { mood: 'stressed', valence: 0.2, energy: 0.9, arousal: 0.9 }
    };

    const mapped = emotionMapping[emotion] || emotionMapping.neutral;

    return {
      ...mapped,
      confidence: confidence * 0.9, // Facial recognition is usually reliable
      detectedEmotion: emotion
    };
  }

  combineAnalyses(pulseAnalysis, temperatureAnalysis, interactionAnalysis, facialAnalysis) {
    const analyses = [pulseAnalysis, temperatureAnalysis, interactionAnalysis, facialAnalysis]
      .filter(a => a && a.confidence > 0);

    if (analyses.length === 0) {
      return { primaryMood: 'neutral', confidence: 0, energy: 0.5, valence: 0.5, arousal: 0.5 };
    }

    // Weight by confidence
    const weightedMoods = {};
    let totalConfidence = 0;
    let totalEnergy = 0;
    let totalValence = 0;
    let totalArousal = 0;

    analyses.forEach(analysis => {
      const weight = analysis.confidence;
      totalConfidence += weight;
      
      if (analysis.mood) {
        weightedMoods[analysis.mood] = (weightedMoods[analysis.mood] || 0) + weight;
      }
      
      totalEnergy += (analysis.energy || 0.5) * weight;
      totalValence += (analysis.valence || 0.5) * weight;
      totalArousal += (analysis.arousal || 0.5) * weight;
    });

    // Find dominant mood
    const sortedMoods = Object.entries(weightedMoods)
      .sort(([,a], [,b]) => b - a);
    
    const primaryMood = sortedMoods[0]?.[0] || 'neutral';
    const moodConfidence = (sortedMoods[0]?.[1] || 0) / totalConfidence;

    // Get secondary moods
    const secondaryMoods = sortedMoods.slice(1, 3)
      .map(([mood, weight]) => ({ mood, confidence: weight / totalConfidence }));

    return {
      primaryMood,
      confidence: Math.min(moodConfidence * totalConfidence / analyses.length, 1),
      energy: totalEnergy / totalConfidence,
      valence: totalValence / totalConfidence,
      arousal: totalArousal / totalConfidence,
      secondaryMoods
    };
  }

  getCurrentMood() {
    if (this.moodHistory.length === 0) {
      return { primaryMood: 'neutral', confidence: 0 };
    }

    // Get recent mood (last 30 seconds)
    const recent = this.moodHistory.filter(m => 
      Date.now() - m.timestamp < 30000
    );

    if (recent.length === 0) {
      return this.moodHistory[this.moodHistory.length - 1];
    }

    // Average recent moods
    const moodCounts = {};
    let totalConfidence = 0;
    let totalEnergy = 0;
    let totalValence = 0;
    let totalArousal = 0;

    recent.forEach(mood => {
      const weight = mood.confidence;
      moodCounts[mood.primaryMood] = (moodCounts[mood.primaryMood] || 0) + weight;
      totalConfidence += weight;
      totalEnergy += mood.energy * weight;
      totalValence += mood.valence * weight;
      totalArousal += mood.arousal * weight;
    });

    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    return {
      primaryMood: dominantMood,
      confidence: Math.min(totalConfidence / recent.length, 1),
      energy: totalEnergy / totalConfidence,
      valence: totalValence / totalConfidence,
      arousal: totalArousal / totalConfidence,
      sampleSize: recent.length
    };
  }

  getMoodTrends(minutes = 10) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const historical = this.moodHistory.filter(m => m.timestamp >= cutoff);
    
    if (historical.length < 2) return null;

    // Analyze trends
    const moodTimeline = historical.map(m => ({
      timestamp: m.timestamp,
      mood: m.primaryMood,
      energy: m.energy,
      valence: m.valence,
      arousal: m.arousal
    }));

    return {
      timeline: moodTimeline,
      averageEnergy: moodTimeline.reduce((sum, m) => sum + m.energy, 0) / moodTimeline.length,
      averageValence: moodTimeline.reduce((sum, m) => sum + m.valence, 0) / moodTimeline.length,
      averageArousal: moodTimeline.reduce((sum, m) => sum + m.arousal, 0) / moodTimeline.length,
      moodChanges: this.countMoodChanges(moodTimeline)
    };
  }

  countMoodChanges(timeline) {
    let changes = 0;
    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].mood !== timeline[i-1].mood) {
        changes++;
      }
    }
    return changes;
  }
}

module.exports = MoodEngine;