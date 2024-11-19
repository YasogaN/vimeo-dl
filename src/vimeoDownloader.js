import axios from "axios";
import fs from "fs/promises";
import { execSync } from "child_process";

export class VimeoDownloader {
    constructor(videoUrl, audioUrl, outputFileName) {
        this.videoUrl = videoUrl;
        this.audioUrl = audioUrl;
        this.outputFileName = outputFileName;
        this.progress = new Map();
    }

    async downloadStream(url, type) {
        const tempFileName = `temp_${type}.mp4`;
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2)
                    this.progress.set(type, percentCompleted);
                    this.logProgress();
                }
            });

            await fs.writeFile(tempFileName, response.data);
            console.log(`\n${type} download completed: ${tempFileName}`);
            return tempFileName;
        } catch (error) {
            this.handleDownloadError(error, type);
            throw error;
        }
    }

    logProgress() {
        try {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            const status = Array.from(this.progress.entries())
                .map(([type, progress]) => `${type}: ${progress}%`)
                .join(' | ');
            process.stdout.write(status);
        } catch (error) {
            console.error('Error logging progress:', error.message);
        }
    }

    async mergeStreams(videoFile, audioFile) {
        try {
            console.log('\nMerging audio and video streams...');
            const command = `ffmpeg -i "${videoFile}" -i "${audioFile}" -c:v copy -c:a aac "${this.outputFileName}"`;
            execSync(command);
            await this.cleanUp([videoFile, audioFile]);
            console.log(`\nMerge completed successfully! Output saved as: ${this.outputFileName}`);
        } catch (error) {
            console.error('Error merging streams:', error.message);
            throw error;
        }
    }

    async audioConvert(audioFile) {
        try {
            console.log('\nConverting audio stream to mp3...');
            const command = `ffmpeg -i "${audioFile}" -c:a libmp3lame "${this.outputFileName}"`;
            execSync(command);
            await this.cleanUp([audioFile]);
            console.log(`\nAudio conversion completed successfully! Output saved as: ${this.outputFileName}`);
        } catch (error) {
            console.error('Error converting audio:', error.message);
            throw error;
        }
    }

    async cleanUp(files) {
        try {
            await Promise.all(files.map(file => fs.unlink(file).catch(() => {})));
        } catch (error) {
            console.error('Error cleaning up temporary files:', error.message);
        }
    }

    async downloadAudio() {
        console.log('Starting audio download process...\n');
        try {
            const audioFile = await this.downloadStream(this.audioUrl, 'audio');
            await this.audioConvert(audioFile);
            console.log(`\nAudio download completed: ${this.outputFileName}`);
        } catch (error) {
            console.error('Audio download process failed:', error.message);
            await this.cleanUp(['temp_audio.mp4']);
        }
    }

    async downloadVideo() {
        console.log('Starting video download process...\n');
        try {
            const videoFile = await this.downloadStream(this.videoUrl, 'video');
            await fs.rename(videoFile, this.outputFileName);
            console.log(`\nVideo download completed: ${this.outputFileName}`);
        } catch (error) {
            console.error('Video download process failed:', error.message);
            await this.cleanUp(['temp_video.mp4']);
        }
    }

    async download() {
        console.log('Starting combined download process...\n');
        try {
            const [videoFile, audioFile] = await Promise.all([
                this.downloadStream(this.videoUrl, 'video'),
                this.downloadStream(this.audioUrl, 'audio')
            ]);
            await this.mergeStreams(videoFile, audioFile);
        } catch (error) {
            console.error('Combined download process failed:', error.message);
            await this.cleanUp(['temp_video.mp4', 'temp_audio.mp4']);
        }
    }

    handleDownloadError(error, type) {
        console.error(`\nError downloading ${type}: ${error.message}`);
        if (error.response) {
            console.error(`HTTP error: ${error.response.status} - ${error.response.statusText}`);
        }
    }
}
