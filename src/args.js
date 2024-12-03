import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import path from 'path';

const validResolutions = ['240', '360', '540', '720', '1080'];

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .options({
        a: { alias: 'audioOnly', desc: 'Download audio only', conflicts: ['vo', 'mr'], coerce: () => true },
        v: { alias: 'videoOnly', desc: 'Download video only', conflicts: ['ao'], coerce: () => true },
        c: { alias: 'combine', desc: 'Download both audio and video', coerce: () => true },
        m: { alias: 'maxResolution', desc: 'Download max resolution video', coerce: () => true },
        r: {
            alias: 'resolution', desc: 'Set resolution (1080, 720, 540, 360, 240)', conflicts: ['ao', 'mr'], coerce: (arg) => {
                if (!validResolutions.includes(String(arg))) throw new Error('Invalid resolution');
                return String(arg);
            }
        },
        p: { alias: 'jsonPlaylist', desc: 'Link to json playlist', conflicts: ['wp'], coerce: String },
        w: { alias: 'webPage', desc: 'Link to webpage', conflicts: ['pj'], coerce: String },
        o: {
            alias: 'output', desc: 'Output file name', coerce: (output) => output.replace(/[^a-zA-Z0-9-_]/g, '_')
        },
        path: { desc: 'Path to directory', coerce: (inputPath) => path.resolve(path.normalize(inputPath.trim())) },
        cp: { alias: 'cookiePath', desc: 'Path to cookies file', coerce: (inputPath) => path.resolve(path.normalize(inputPath.trim())) }
    })
    .check((argv) => {
        const { a, v, c, m, r, p, w, o } = argv;
        if ((a || m) && r) throw new Error('Cannot use resolution flags with audio-only mode');
        if (a && v) throw new Error('Cannot use audio and video-only modes together');
        if (p && w) throw new Error('Cannot use both playlist and webpage links');
        if (!p && !w) throw new Error('Provide either a playlist or webpage link');
        if (!o) throw new Error('Output file name is required');
        if (!a && !v && !c) throw new Error('Specify a mode (audioOnly, videoOnly, combined)');
        if (c && (a || v)) throw new Error('Combined mode cannot contain audio or video flags');
        if (m && r) throw new Error('Cannot use max resolution and custom resolution together');
        if (v && !(m || r)) throw new Error('Resolution flag is missing in video-only mode');
        return true;
    })
    .argv;

export default argv;

