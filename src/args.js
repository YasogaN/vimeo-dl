import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import path from 'path';

const validResolutions = ['240', '360', '540', '720', '1080'];

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('a', { alias: 'audioOnly', description: 'Download audio only', conflicts: ['vo', 'mr'], coerce: () => true })
    .option('v', { alias: 'videoOnly', description: 'Download video only', conflicts: ['ao'], coerce: () => true })
    .option('c', { alias: 'combine', description: 'Download both audio and video', coerce: () => true })
    .option('m', { alias: 'maxResolution', description: 'Download max resolution video', coerce: () => true })
    .option('r', {
        alias: 'resolution', description: 'Set resolution (1080, 720, 540, 360, 240)', conflicts: ['ao', 'mr'], coerce: (arg) => {
            arg = String(arg);
            if (!validResolutions.includes(arg)) throw new Error('Invalid resolution');
            return arg;
        }
    })
    .option('p', { alias: 'jsonPlaylist', description: 'Link to json playlist', conflicts: ['wp'], coerce: String })
    .option('w', { alias: 'webPage', description: 'Link to webpage', conflicts: ['pj'], coerce: String })
    .option('o', { alias: 'output', description: 'Output file name', coerce: (output) => {return output.replace(/[^a-zA-Z0-9-_]/g, '_');}})
    .option('path', { description: 'Path to directory', coerce: (inputPath) => path.resolve(path.normalize(inputPath.trim())) })
    .option('cp', { alias: 'cookiePath', description: 'Path to cookies file', coerce: (inputPath) => path.resolve(path.normalize(inputPath.trim())) })
    .check((argv) => {
        const { a, v, c, m, r, p, w, o, } = argv;

        // Validate conflicting options
        if ((a || m) && r) throw new Error('Cannot use resolution flags with audio-only mode');
        if (a && v) throw new Error('Cannot use audio and video-only modes together');
        if (p && w) {
            console.log(argv);
            throw new Error('Cannot use both playlist and webpage links');
        } 
        if (!p && !w) throw new Error('Provide either a playlist or webpage link');
        if (!o) throw new Error('Output file name is required');

        // Validate mode (audioOnly, videoOnly, combined)
        if (!a && !v && !c) throw new Error('Specify a mode (audioOnly, videoOnly, combined)');

        // Validate audio/video mode combinations
        if (c && (a || v)) throw new Error('Combined mode cannot contain audio or video flags');

        // Validate resolution options
        if (m && r) throw new Error('Cannot use max resolution and custom resolution together');
        if (v && !(m || r)) throw new Error('Resolution flag is missing in video-only mode');

        return true;
    })
    .argv;

export default argv;
