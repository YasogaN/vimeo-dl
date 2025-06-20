import { MediaDownloader } from "./src/mediaDownloader.js";
import { getVideoUrl, getAudioUrl, parseAndTransformUrl } from "./src/urlParsers.js";
import { loadPlaylist, loadWebpage } from "./src/utils.js";
import argv from "./src/args.js";
import { checkFfmpeg } from "./src/checkFfmpeg.js";

/**
 * Main function to download and process media content.
 * 
 * This function checks for ffmpeg, parses command line arguments, loads the webpage or playlist,
 * constructs the output file name, and initializes the MediaDownloader to download and process
 * the video and/or audio.
 * 
 * @async
 * @function main
 * @returns {Promise<void>} A promise that resolves when the download and processing is complete.
 */
async function main() {
    await checkFfmpeg();
    const { a, v, c, p, w, o, r, m, path, cp, disclaimer } = argv;
    const playlistUrl = p || await loadWebpage(w, cp);
    const playlistData = await loadPlaylist(playlistUrl);
    const outName = path ? `${path}\\${o}` : o;

    const audioUrl = parseAndTransformUrl(playlistUrl, await getAudioUrl(playlistData));
    const videoUrl = parseAndTransformUrl(playlistUrl, await getVideoUrl(playlistData, m, r));
    const downloader = new MediaDownloader(
        v || c ? videoUrl : null,
        a || c ? audioUrl : null,
        `${outName}${v || a ? '.mp3' : '.mp4'}`
    );

    if (a) await downloader.downloadAndProcess('audio');
    else if (v) await downloader.downloadAndProcess('video');
    else if (c) await downloader.download();
}

main().catch(console.error);