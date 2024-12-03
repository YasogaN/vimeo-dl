import { exec } from 'child_process';
import os from 'os';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const cmds = {
    win32: ['winget --version', 'winget install Gyan.FFmpeg', 'start https://ffmpeg.org/download.html'],
    darwin: ['brew --version', 'brew install ffmpeg', 'open https://brew.sh/'],
    linux: ['sudo apt-get --version', 'sudo apt-get install ffmpeg', 'xdg-open https://ffmpeg.org/download.html']
};

function runCmd(cmd, onSuccess, onError) {
    exec(cmd, (err) => (err ? onError && onError() : onSuccess && onSuccess()));
}

function prompt(msg, yes, no) {
    rl.question(msg, (a) => (['y', 'yes'].includes(a.toLowerCase()) ? yes() : no()));
}

export function checkFfmpeg() {
    runCmd('ffmpeg -version', () => rl.close(), () => {
        prompt('ffmpeg not found. Install? ([y]/[n]): ', () => {
            const [chk, ins, fb] = cmds[os.platform()] || [];
            if (!chk) return console.log('Unsupported OS'), rl.close();
            runCmd(chk, () => runCmd(ins, () => console.log('Installed!'), () => runCmd(fb)), () => runCmd(fb));
        }, () => console.log('ffmpeg is required. Exiting...'), rl.close());
    });
}