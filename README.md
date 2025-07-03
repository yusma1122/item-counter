# 📹 Item Counter

Real-time object counting application using webcam and computer vision techniques. Count objects passing through a selected area with customizable sensitivity and background-based detection.

![Item Counter Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## 🚀 Features

- **Real-time Webcam Access**: Stream video directly from your camera
- **Interactive Area Selection**: Drag and drop to select detection zones (max 100x100px)
- **Background-Based Detection**: Set baseline colors to prevent false positives
- **Smart Object Counting**: Only counts objects entering the area, not exiting
- **Customizable Sensitivity**: Fine-tune detection threshold (5-150 range)
- **Cooldown System**: Prevent duplicate counting of the same object
- **Responsive Design**: Works on desktop and mobile devices
- **Zero Dependencies**: Pure vanilla JavaScript implementation

## 🛠️ Technologies Used

- **HTML5**: Structure and Canvas API for image processing
- **CSS3**: Custom animations and responsive design
- **JavaScript (ES6+)**: Core logic and webcam integration
- **Tailwind CSS**: Modern utility-first styling
- **WebRTC API**: Camera access via `getUserMedia()`
- **Canvas API**: Image data processing and color analysis

## 📋 Requirements

### Browser Support
- **Chrome**: 53+ ✅
- **Firefox**: 36+ ✅  
- **Safari**: 11+ ✅
- **Edge**: 12+ ✅

### System Requirements
- **Camera**: Webcam or built-in camera required
- **HTTPS**: Required for camera access (or localhost for development)
- **JavaScript**: Must be enabled
- **Minimum Resolution**: 640x480 recommended

### Permissions
- **Camera Access**: Required for video streaming
- **Microphone**: Not required (video only)

### Step-by-Step Guide

1. **🎥 Start Camera**
   - Click "Start Camera" button
   - Allow camera permissions when prompted

2. **📍 Select Detection Area**
   - Click and drag on the video to create a selection box
   - Maximum size: 100x100 pixels for optimal performance
   - Area should be small and focused

3. **🎯 Set Background**
   - Ensure the selected area is empty (no objects)
   - Click "Set Background" to capture baseline colors
   - This prevents false positives from background changes

4. **⚙️ Configure Settings**
   - **Sensitivity (5-150)**: Start with 5-10 for minimal false positives
   - **Cooldown (500-3000ms)**: Prevent counting same object multiple times
   - Adjust based on your specific use case

5. **📊 Monitor Results**
   - Counter increases when objects enter the detection area
   - Status shows real-time detection information
   - Use "Reset Counter" or "Reset Area" as needed

### 💡 Pro Tips

- **Low Light**: Increase sensitivity for darker environments
- **High Contrast**: Use objects with colors different from background
- **Stable Setup**: Mount camera to reduce movement-based false positives
- **Testing**: Start with obvious objects (white paper on dark background)

## ⚙️ Configuration Options

### Sensitivity Settings
| Value | Use Case | Description |
|-------|----------|-------------|
| 5-15 | High Precision | Minimal false positives, clear contrast needed |
| 15-30 | Balanced | Good for most scenarios |
| 30-60 | High Sensitivity | Detects subtle changes |
| 60+ | Debug Mode | Very sensitive, may have false positives |

### Cooldown Settings
| Value | Use Case | Description |
|-------|----------|-------------|
| 500ms | Fast Objects | Quick-moving items |
| 1000ms | Standard | Most use cases |
| 2000ms+ | Slow Objects | Large or slow-moving items |

## 🏗️ File Structure

```
item-counter/
├── index.html          # Main HTML structure
├── style.css           # Custom CSS styles
├── script.js           # Core JavaScript logic
└── README.md           # Documentation
```

## 🎯 Use Cases

- **📦 Package Counting**: Count packages on conveyor belts
- **👥 People Counting**: Monitor foot traffic in specific areas
- **🚗 Vehicle Counting**: Count cars passing through gates
- **🏭 Production Line**: Monitor manufactured items
- **🔬 Laboratory**: Count specimens or samples
- **📚 Inventory**: Track items being moved

## 🐛 Troubleshooting

### Common Issues

**❌ Camera Not Working**
- Check browser permissions
- Ensure HTTPS connection (required for camera access)
- Try different browsers
- Check if camera is being used by other applications

**❌ False Positives**
- Lower sensitivity value (try 5-10)
- Ensure stable lighting conditions
- Capture background when area is completely empty
- Increase cooldown time

**❌ Objects Not Detected**
- Increase sensitivity gradually
- Check object-background contrast
- Ensure objects are large enough in the detection area
- Verify lighting conditions

**❌ Performance Issues**
- Use smaller detection areas
- Close unnecessary browser tabs
- Check CPU usage
- Reduce video quality if needed

### Debug Mode
Monitor real-time values in browser console:
```javascript
// Open browser developer tools (F12)
// Watch console for detection values
```

## 🔧 Advanced Configuration

### Custom Detection Algorithm
The application uses **Euclidean distance** in RGB color space:

```javascript
distance = √[(r₁-r₂)² + (g₁-g₂)² + (b₁-b₂)²]
```

### Performance Optimization
- **Detection Interval**: 100ms (10 FPS)
- **Maximum Area**: 100x100px (10,000 pixels)
- **Color Sampling**: Average RGB values
- **Memory Management**: Automatic cleanup on page unload

## 🚀 Future Enhancements

- [ ] Multiple detection areas
- [ ] Export count data (CSV/JSON)
- [ ] Motion-based detection
- [ ] Machine learning integration
- [ ] Video recording with annotations
- [ ] Mobile app version
- [ ] Cloud sync capabilities

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yusma1122](https://github.com/yusma1122)
- Email: your.email@example.com

## 🙏 Acknowledgments

- WebRTC community for camera access standards
- Tailwind CSS for beautiful styling utilities
- MDN Web Docs for comprehensive API documentation

## 📈 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| getUserMedia() | ✅ 53+ | ✅ 36+ | ✅ 11+ | ✅ 12+ |
| Canvas ImageData | ✅ | ✅ | ✅ | ✅ |
| ES6 Classes | ✅ 49+ | ✅ 45+ | ✅ 9+ | ✅ 13+ |
| CSS Grid | ✅ 57+ | ✅ 52+ | ✅ 10.1+ | ✅ 16+ |

---

⭐ **Star this repository if you found it helpful!**

📞 **Need help?** Open an issue or contact the maintainer.