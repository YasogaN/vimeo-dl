# Media Stream Utility

A CLI utility for downloading media content from playlist.json URLs or webpages containing embedded media players.

## ⚠️ LEGAL DISCLAIMER

**This tool is provided for PERSONAL, EDUCATIONAL, and ARCHIVAL purposes only.**

### YOUR RESPONSIBILITIES:

- ✅ Comply with all applicable copyright laws
- ✅ Respect content creators' intellectual property rights
- ✅ Follow the platform's Terms of Service
- ✅ Ensure you have proper authorization to download content
- ✅ Use only for personal, educational, or archival purposes

### IMPORTANT LIMITATIONS:

- 🚫 This software does **NOT** bypass DRM or access encrypted content
- 🚫 Does **NOT** work with protected or premium content
- 🚫 Only works with publicly accessible, unencrypted streams
- ⚠️ Users must provide their own cookies for authenticated content

**Use at your own risk and responsibility.**

## Installation & Usage

### Via NPX (Recommended)

```bash
npx media-stream-util [options]
```

### Options

| Flag                  | Description                               | Example                                       |
| --------------------- | ----------------------------------------- | --------------------------------------------- |
| `-p, --jsonPlaylist`  | Direct link to playlist.json file         | `-p "https://example.com/playlist.json"`      |
| `-w, --webPage`       | Link to webpage with embedded media       | `-w "https://example.com/page"`               |
| `-cp, --cookiePath`   | Path to cookies.json file                 | `-cp "./cookies.json"`                        |
| `-a, --audioOnly`     | Download audio only                       | `-a`                                          |
| `-v, --videoOnly`     | Download video only (requires resolution) | `-v -r 720`                                   |
| `-c, --combine`       | Download and merge audio + video          | `-c`                                          |
| `-r, --resolution`    | Set video resolution                      | `-r 1080` (options: 240, 360, 540, 720, 1080) |
| `-m, --maxResolution` | Download maximum available resolution     | `-m`                                          |
| `-o, --output`        | Output filename                           | `-o "my-video"`                               |
| `--path`              | Output directory path                     | `--path "./downloads"`                        |
| `--help`              | Show help                                 | `--help`                                      |
| `--version`           | Show version                              | `--version`                                   |
| `--disclaimer`        | Prints disclaimer                         | `--disclaimer`                                |

### Examples

```bash
# Download audio only from direct playlist URL
npx media-stream-util -p "https://example.com/playlist.json" -a -o "audio-file"

# Download 720p video from webpage with cookies
npx media-stream-util -w "https://example.com/page" -cp "./cookies.json" -v -r 720 -o "video-file"

# Download and combine audio+video at max resolution
npx media-stream-util -p "https://example.com/playlist.json" -c -m -o "combined-file"
```

## Cookie Format

If accessing authenticated content, provide cookies in JSON format:

```json
[
  {
    "name": "session_id",
    "value": "your_session_value",
    "domain": ".example.com",
    "path": "/",
    "secure": true,
    "httpOnly": true
  }
]
```

## Requirements

- Node.js 14+
- FFmpeg (will prompt to install if missing)

## Technical Notes

- Only works with unencrypted HLS/DASH streams
- Requires direct access to playlist.json or embedded player URLs
- Does not perform web scraping or automated platform interaction
- All URLs and authentication must be provided by the user

## License

MIT License - See LICENSE file for details.

**This software is provided "as is" without warranty of any kind.**

## Support

This tool is provided as-is for educational purposes. Users are responsible for ensuring their usage complies with applicable laws and platform terms of service.
