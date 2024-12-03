import { VimeoDownloader } from "./src/vimeoDownloader.js";
import { getVideoUrl, getAudioUrl, parseAndTransformUrl } from "./src/urlParsers.js";
import { loadPlaylist, loadWebpage } from "./src/utils.js";
import argv from "./src/args.js";
import { checkFfmpeg } from "./src/checkFfmpeg.js";

async function main() {
    await checkFfmpeg();
    const { a: audioOnly, v: videoOnly, c: combined, p: playlistUrl, w: webPageUrl, o: outputName, r: resolution, m: maxResolution, path, cp: cookiePath } = argv
    console.log('Loading URL...')
    const url = playlistUrl ? playlistUrl : await loadWebpage(webPageUrl, cookiePath)
    console.log('URL:', url)
    const data = await loadPlaylist(url) 
    const newOutputName = path ? path + '\\' + outputName : outputName
    if (audioOnly) {
        const audioUrl = parseAndTransformUrl(url, await getAudioUrl(data))
        const downloader = new VimeoDownloader(null, audioUrl, newOutputName + '.mp3')
        await downloader.downloadAndProcess('audio');
    } else if (videoOnly) {
        const videoUrl = parseAndTransformUrl(url, await getVideoUrl(data, maxResolution, resolution))
        const downloader = new VimeoDownloader(videoUrl, null, newOutputName + '.mp4')
        await downloader.downloadAndProcess('video');
    } else if (combined) {
        const audioUrl = parseAndTransformUrl(url, await getAudioUrl(data))
        const videoUrl = parseAndTransformUrl(url, await getVideoUrl(data, maxResolution, resolution))
        const downloader = new VimeoDownloader(videoUrl, audioUrl, newOutputName + '.mp4')
        await downloader.download();
    }
}

main().catch(console.error);