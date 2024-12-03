import { VimeoDownloader } from "./src/vimeoDownloader.js";
import { getVideoUrl, getAudioUrl, parseAndTransformUrl } from "./src/urlParsers.js";
import { loadPlaylist, loadWebpage } from "./src/utils.js";
import argv from "./src/args.js";
import { checkFfmpeg } from "./src/checkFfmpeg.js";

async function main() {
    await checkFfmpeg();
    const { a, v, c, p, w, o, r, m, path, cp } = argv;
    const url = p || await loadWebpage(w, cp);
    const data = await loadPlaylist(url);
    const outName = path ? `${path}\\${o}` : o;

    const audioUrl = parseAndTransformUrl(url, await getAudioUrl(data));
    const videoUrl = parseAndTransformUrl(url, await getVideoUrl(data, m, r));
    const downloader = new VimeoDownloader(
        v || c ? videoUrl : null, 
        a || c ? audioUrl : null, 
        `${outName}${v || a ? '.mp3' : '.mp4'}`
    );

    if (a) await downloader.downloadAndProcess('audio');
    else if (v) await downloader.downloadAndProcess('video');
    else if (c) await downloader.download();
}

main().catch(console.error);