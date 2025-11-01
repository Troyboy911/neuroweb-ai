# NeuroWeb AI - Quick Start Guide

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Start the browser**
```bash
npm start
```

For development mode with DevTools:
```bash
npm run dev
```

## 🧠 What NeuroWeb AI Does

### Core Features
- **Biometric Monitoring**: Tracks pulse, temperature, and interaction patterns
- **Mood Detection**: Analyzes emotional state in real-time
- **Adaptive UI**: Adjusts layout, colors, and interactions based on mood
- **User Profiling**: Learns personality traits and tendencies
- **Self-Learning**: Continuously improves through ML algorithms

### How It Works
1. **Sensors**: Monitors biometric data through touch, temperature, and interaction
2. **Analysis**: Determines mood using sophisticated algorithms
3. **Adaptation**: Automatically adjusts browser experience
4. **Learning**: Improves predictions over time

## 🎨 Mood-Based Adaptations

### 😊 Happy
- Warm colors, increased brightness
- Engaging content suggestions
- Enhanced navigation

### 😰 Stressed  
- Reduced brightness, simplified layout
- Larger click areas, minimal distractions
- Calm color schemes

### 🎯 Focused
- High contrast, minimal interface
- Keyboard shortcuts enabled
- Hidden sidebars

### 😌 Relaxed
- Comfortable spacing, gentle animations
- Warm color temperature
- Reduced interaction friction

## 🔧 Configuration

### Settings Available
- **Biometric Sensors**: Enable/disable pulse, temperature, webcam
- **Adaptation Sensitivity**: Control how often adaptations occur (1-10)
- **Privacy Settings**: Manage data collection and storage
- **Manual Override**: Take control of automatic adaptations

### Privacy First
- All biometric data processed locally
- No sensitive information transmitted
- Complete user control over data
- Anonymous usage statistics optional

## 📁 Project Structure

```
neuroweb-ai/
├── src/
│   ├── main.js              # Electron main process
│   ├── renderer/            # Browser UI
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── renderer.js
│   └── modules/             # Core AI modules
│       ├── BiometricProcessor.js
│       ├── MoodEngine.js
│       ├── AdaptiveUI.js
│       ├── UserProfiler.js
│       └── LearningCore.js
├── package.json
└── README.md
```

## 🧪 Testing

Run quick component tests:
```bash
node quick-test.js
```

## 🤝 Contributing

This is a revolutionary browser that adapts to you! Contributions welcome in:
- Biometric sensor integration
- ML algorithm improvements
- UI/UX enhancements
- Performance optimization

## 📄 License

MIT License - See LICENSE file for details

---

**NeuroWeb AI** - The browser that understands you, adapts to you, and grows with you. 🧠✨