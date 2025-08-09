const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

// Rate limiter to prevent abuse
const limiter = rateLimit({ windowMs: 60 * 1000, max: 10 }); // 10 requests per minute
app.use('/api/', limiter);

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

app.post('/api/convert', async (req, res) => {
  const { url, format = 'mp4', quality = 'best' } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  // Basic URL validation
  try {
    const u = new URL(url);
    if (!/youtube\\.com|youtu\\.be/.test(u.hostname)) {
      return res.status(400).json({ error: 'Only YouTube URLs are supported' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const filenameBase = `video_${Date.now()}`;
  const outPath = path.join(DOWNLOAD_DIR, `${filenameBase}.%(ext)s`);

  // Build yt-dlp args
  const args = ['-o', outPath, url];
  if (format === 'mp3') {
    args.push('--extract-audio', '--audio-format', 'mp3');
  } else if (format === 'mp4' || format === 'webm') {
    args.push('-f', 'bestvideo[ext=' + (format === 'mp4' ? 'mp4' : 'webm') + ']+bestaudio/best');
  }
  if (quality !== 'best') {
    // quality can be 1080p, 720p etc. We append a filter
    args.push('-f', `bestvideo[height<=${parseInt(quality)}]+bestaudio/best`);
  }

  const ytdlp = spawn('yt-dlp', args);
  let stderr = '';
  ytdlp.stderr.on('data', (data) => { stderr += data.toString(); });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error('yt-dlp failed:', stderr);
      return res.status(500).json({ error: 'Conversion failed', details: stderr });
    }

    // find the produced file
    const files = fs.readdirSync(DOWNLOAD_DIR).filter(f => f.startsWith(filenameBase));
    if (files.length === 0) return res.status(500).json({ error: 'No output file' });

    const filePath = path.join(DOWNLOAD_DIR, files[0]);
    res.json({ downloadUrl: `/downloads/${path.basename(filePath)}` });
  });
});

// Static serve downloads
app.use('/downloads', express.static(DOWNLOAD_DIR));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));