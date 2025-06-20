import axios from "axios";
import fs from "fs/promises";
import { execSync } from "child_process";

export class MediaDownloader {
    constructor(videoUrl, audioUrl, outputFileName) {
        this.videoUrl = videoUrl;
        this.audioUrl = audioUrl;
        this.outputFileName = outputFileName;
        this.progress = new Map();
    }    /**
     * Downloads a stream from the given URL and saves it as a temporary file.
     * Note: This method only works with publicly accessible, unencrypted streams.
     *
     * @param {string} url - The URL of the stream to download.
     * @param {string} type - The type of the stream (used for naming the temporary file).
     * @returns {Promise<string>} - A promise that resolves to the name of the temporary file.
     * @throws {Error} - Throws an error if the download fails.
     */
    async downloadStream(url, type) {
        if (!url) {
            throw new Error(`No ${type} URL provided`);
        }

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

    /**
     * Updates the progress of a specific type and logs the progress.
     *
     * @param {string} type - The type of progress to update (e.g., 'download', 'upload').
     * @param {number} loaded - The amount of data that has been loaded.
     * @param {number} total - The total amount of data to be loaded.
     */
    updateProgress(type, loaded, total) {
        const percentCompleted = ((loaded / total) * 100).toFixed(2);
        this.progress.set(type, percentCompleted);
        this.logProgress();
    }

    /**
     * Logs the current progress of different types to the console.
     * The progress is displayed as a percentage for each type, separated by a pipe (|) symbol.
     * It clears the current line in the console and writes the updated progress status.
     */
    logProgress() {
        const status = Array.from(this.progress.entries())
            .map(([type, progress]) => `${type}: ${progress}%`)
            .join(' | ');
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(status);
    }

    /**
     * Merges the provided video and audio streams into a single output file.
     *
     * @param {string} videoFile - The path to the video file.
     * @param {string} audioFile - The path to the audio file.
     * @returns {Promise<void>} - A promise that resolves when the merge is complete.
     * @throws {Error} - Throws an error if the merging process fails.
     */
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

    /**
     * Converts an audio file to MP3 format using ffmpeg.
     *
     * @param {string} audioFile - The path to the audio file to be converted.
     * @returns {Promise<void>} - A promise that resolves when the conversion is complete.
     * @throws {Error} - Throws an error if the conversion fails.
     */
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

    /**
     * Asynchronously deletes an array of files.
     *
     * @param {string[]} files - An array of file paths to be deleted.
     * @returns {Promise<void>} A promise that resolves when all files have been deleted.
     */
    async cleanUp(files) {
        await Promise.all(files.map(file => fs.unlink(file).catch(() => { })));
    }    /**
     * Downloads and processes a media file (audio or video) from a specified URL.
     * Sanitizes all log output to prevent exposure of sensitive information.
     *
     * @param {string} type - The type of media to download ('audio' or 'video').
     * @returns {Promise<void>} - A promise that resolves when the download and processing are complete.
     * @throws {Error} - Throws an error if the download or processing fails.
     */
    async downloadAndProcess(type) {
        const isAudio = type === 'audio';
        const url = isAudio ? this.audioUrl : this.videoUrl;

        if (!url) {
            console.error(`No ${type} URL available for download`);
            return;
        }

        console.log(`Starting ${type} download...`);
        try {
            const tempFile = await this.downloadStream(url, type);
            if (isAudio) {
                await this.convertAudioToMp3(tempFile);
            } else {
                await fs.rename(tempFile, this.outputFileName);
                console.log(`\n${type} download completed: ${this.outputFileName}`);
            }
        } catch (error) {
            const sanitizedError = error.message.replace(/https?:\/\/[^\s]+/g, '[URL_REDACTED]');
            console.error(`${type} download process failed: ${sanitizedError}`);
            await this.cleanUp([`temp_${type}.mp4`]);
        }
    }    /**
     * Downloads video and audio streams concurrently and merges them.
     * If the download or merge process fails, it cleans up temporary files.
     * 
     * @async
     * @function download
     * @returns {Promise<void>} A promise that resolves when the download and merge process is complete.
     * @throws {Error} Throws an error if the download or merge process fails.
     */
    async download() {
        console.log('Starting combined download process...\n');
        try {
            const [videoFile, audioFile] = await Promise.all([
                this.downloadStream(this.videoUrl, 'video'),
                this.downloadStream(this.audioUrl, 'audio')
            ]);
            await this.mergeStreams(videoFile, audioFile);
        } catch (error) {
            const sanitizedError = error.message.replace(/https?:\/\/[^\s]+/g, '[URL_REDACTED]');
            console.error(`Combined download process failed: ${sanitizedError}`);
            await this.cleanUp(['temp_video.mp4', 'temp_audio.mp4']);
        }
    }

    /**
     * Handles errors that occur during the download process.
     * Sanitizes error output to avoid exposing sensitive information.
     *
     * @param {Error} error - The error object that was thrown.
     * @param {string} type - The type of download that was being attempted.
     */
    handleDownloadError(error, type) {
        // Sanitize error messages to avoid exposing sensitive URLs or tokens
        const sanitizedMessage = error.message.replace(/[?&](access_token|token|key|auth)=[^&\s]*/gi, '[REDACTED]');
        console.error(`\nError downloading ${type}: ${sanitizedMessage}`);
        if (error.response) {
            console.error(`HTTP error: ${error.response.status} - ${error.response.statusText}`);
        }
    }
}
