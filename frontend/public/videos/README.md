# Hero Background Video

## Required Video Specifications

Place your hero background video files in this directory with the following names:
- `hero-background.mp4` (primary format)
- `hero-background.webm` (alternative format for better compatibility)

## Video Requirements

### Theme
- **Style**: Professional anime/illustration style work-from-home scenes
- **Content**: Person at desk working on computer, coding, professional remote work setup
- **Mood**: Calm, professional, inspiring

### Technical Specifications
- **Duration**: 15-30 seconds (will loop seamlessly)
- **Resolution**: Minimum 1920x1080 (Full HD), 4K preferred
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30fps or 60fps
- **File Size**: Optimized for web (ideally under 5MB for MP4)

### Quality Guidelines
- Clean, professional aesthetic
- Smooth, subtle movements (avoid fast or jarring motion)
- Good lighting and color grading
- Loopable (seamless transition from end to start)

## Recommended Sources

### Free Stock Video Sites
1. **Pexels Videos** (https://www.pexels.com/videos/)
   - Search: "anime work from home", "coding animation", "remote work illustration"

2. **Pixabay** (https://pixabay.com/videos/)
   - Search: "desk setup animation", "workspace"

3. **Mixkit** (https://mixkit.co/free-stock-video/)
   - Search: "work from home", "coding"

### Custom Video Creation
- **Fiverr**: Commission anime-style work-from-home animation
- **Upwork**: Hire motion graphics designer
- **Canva Pro**: Create animated scenes with work-from-home templates

### AI Video Generation (Alternative)
- **Runway ML**: Generate custom video clips
- **Pika Labs**: AI video generation
- **Kaiber**: Transform static images into videos

## Quick Setup

1. Download or create your video
2. Convert to MP4 and WebM formats (use online converters or ffmpeg)
3. Rename files to `hero-background.mp4` and `hero-background.webm`
4. Place in this directory (`/public/videos/`)
5. Video will automatically play in the hero section

## FFmpeg Conversion Commands

If you need to convert your video:

```bash
# Convert to optimized MP4
ffmpeg -i input.mov -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k hero-background.mp4

# Convert to WebM
ffmpeg -i input.mov -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus hero-background.webm
```

## Notes
- The video plays with a semi-transparent white gradient overlay to ensure text readability
- Video is set to autoplay, loop, and mute for best UX
- If no video is present, the animated gradient background will show as fallback
