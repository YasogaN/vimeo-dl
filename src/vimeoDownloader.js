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
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
                onDownloadProgress: (progressEvent) => {
                    this.updateProgress(type, progressEvent.loaded, progressEvent.total);
                },
            });

            await fs.writeFile(tempFileName, response.data);
            console.log(`\n${type} download completed: ${tempFileName}`);
            return tempFileName;
        } catch (error) {
            this.handleDownloadError(error, type);
            throw new Error(`Failed to download ${type}`);
        }
    }

    updateProgress(type, loaded, total) {
        const percentCompleted = ((loaded / total) * 100).toFixed(2);
        this.progress.set(type, percentCompleted);
        this.logProgress();
    }

    logProgress() {
        const status = Array.from(this.progress.entries())
            .map(([type, progress]) => `${type}: ${progress}%`)
            .join(' | ');
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(status);
    }

    async mergeStreams(videoFile, audioFile) {
        try {
            console.log('\nMerging audio and video streams...');
            execSync(`ffmpeg -i "${videoFile}" -i "${audioFile}" -c:v copy -c:a aac "${this.outputFileName}"`);
            console.log(`\nMerge completed successfully! Output saved as: ${this.outputFileName}`);
            await this.cleanUp([videoFile, audioFile]);
        } catch (error) {
            throw new Error('Error merging streams');
        }
    }

    async convertAudioToMp3(audioFile) {
        try {
            console.log('\nConverting audio stream to mp3...');
            execSync(`ffmpeg -i "${audioFile}" -c:a libmp3lame "${this.outputFileName}"`);
            console.log(`\nAudio conversion completed successfully! Output saved as: ${this.outputFileName}`);
            await this.cleanUp([audioFile]);
        } catch (error) {
            throw new Error('Error converting audio');
        }
    }

    async cleanUp(files) {
        await Promise.all(files.map(file => fs.unlink(file).catch(() => {})));
    }

    async downloadAndProcess(type) {
        const isAudio = type === 'audio';
        const url = isAudio ? this.audioUrl : this.videoUrl;
        try {
            const tempFile = await this.downloadStream(url, type);
            if (isAudio) {
                await this.convertAudioToMp3(tempFile);
            } else {
                await fs.rename(tempFile, this.outputFileName);
                console.log(`\n${type} download completed: ${this.outputFileName}`);
            }
        } catch (error) {
            console.error(`${type} download process failed: ${error.message}`);
            await this.cleanUp([`temp_${type}.mp4`]);
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
            console.error(`Combined download process failed: ${error.message}`);
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
