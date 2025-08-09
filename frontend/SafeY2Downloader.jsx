import React, { useState } from "react";

export default function SafeY2Downloader() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("1080p");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState("");

  function validateUrl(u) {
    try {
      const parsed = new URL(u);
      return /youtube\\.com|youtu\\.be/.test(parsed.hostname);
    } catch (e) {
      return false;
    }
  }

  async function handleDownload(e) {
    e.preventDefault();
    setError("");
    setDownloadLink("");
    if (!url.trim()) {
      setError("Please paste a YouTube URL.");
      return;
    }
    if (!validateUrl(url.trim())) {
      setError("Please enter a valid YouTube URL (youtube.com or youtu.be)");
      return;
    }

    setLoading(true);
    setProgress(10);
    try {
      const resp = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), format, quality })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Conversion failed");
      setDownloadLink(data.downloadUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold">SafeY2Downloader</h1>
        <form onSubmit={handleDownload} className="space-y-4 mt-4">
          <input value={url} onChange={(e)=>setUrl(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="YouTube link..." />
          <div className="flex gap-2">
            <select value={format} onChange={(e)=>setFormat(e.target.value)} className="p-2 border rounded-lg">
              <option value="mp4">MP4</option>
              <option value="mp3">MP3</option>
              <option value="webm">WEBM</option>
            </select>
            <select value={quality} onChange={(e)=>setQuality(e.target.value)} className="p-2 border rounded-lg">
              <option>1080p</option>
              <option>720p</option>
              <option>480p</option>
              <option>Best Available</option>
            </select>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" disabled={loading}>{loading ? "Working..." : "Convert"}</button>
          </div>
        </form>

        {error && <p className="text-red-600 mt-3">{error}</p>}
        {downloadLink && <div className="mt-3"><a className="text-indigo-600" href={downloadLink}>Download here</a></div>}
      </div>
    </div>
  );
}