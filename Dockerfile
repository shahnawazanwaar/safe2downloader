FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production || npm install --production
COPY . .
# Install yt-dlp and ffmpeg
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg && pip3 install -U yt-dlp
EXPOSE 4000
CMD ["node", "index.js"]