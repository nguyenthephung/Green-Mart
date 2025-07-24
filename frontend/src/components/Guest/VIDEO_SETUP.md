# Video Files for Testing

## Add these video files to your `public` folder:

1. **natural_banner.mp4** - Main video file
2. **sample-video.mp4** - Alternative test video
3. **demo.webm** - WebM format for better browser support

## Free test videos you can download:

### Big Buck Bunny (Creative Commons)
- Direct MP4: http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
- Size: ~5.3MB, Duration: 10 seconds

### Sample Videos
- https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4
- Size: 1MB, Resolution: 1280x720

### Commands to download (run in public folder):
```bash
cd public
curl -o BigBuckBunny.mp4 "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
curl -o sample-video.mp4 "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
```

## Usage in HTML5VideoModal:
```tsx
<HTML5VideoModal
  isOpen={isVideoModalOpen}
  onClose={() => setIsVideoModalOpen(false)}
  videoSrc="/BigBuckBunny.mp4"  // or "/sample-video.mp4"
  title="Test Video"
  poster="/logo.jpg"
/>
```
