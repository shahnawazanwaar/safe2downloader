SafeY2Downloader - Simple self-hosted YouTube downloader (demo)

Contents:
- server/index.js        -> Express server using yt-dlp to convert videos
- package.json           -> Node dependencies
- Dockerfile             -> Dockerfile to run server with yt-dlp and ffmpeg
- frontend/SafeY2Downloader.jsx -> React component (example) to integrate with server

Important notes:
- This project is for educational/demo purposes. Downloading YouTube content may violate YouTube's Terms of Service and copyright law.
- Deploy on VPS you control. Use HTTPS and apply rate-limiting.
- Clean downloaded files periodically to avoid storage growth.

To run locally (Linux):
1. Install Node.js, npm, Python3, ffmpeg and yt-dlp:
   sudo apt update
   sudo apt install -y nodejs npm python3 python3-pip ffmpeg
   sudo pip3 install -U yt-dlp

2. Start server:
   cd server
   npm install
   node index.js

3. Serve frontend separately (or place built frontend in same host and proxy /api to server).

Docker:
- Build: docker build -t safey2 .
- Run: docker run -p 4000:4000 safey2

Security:
- Use express-rate-limit and captcha to prevent abuse.
- Delete downloads older than a short TTL (cron job).