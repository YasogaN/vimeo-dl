import { exec } from 'child_process';
import os from 'os';
import readline from 'readline';

// Initialize readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export function checkFfmpeg() {
    // Check if ffmpeg is installed by running "ffmpeg -version"
    exec('ffmpeg -version', (err, stdout, stderr) => {
        if (!err) {
            rl.close();
        } else {
            askToInstall();
        }
    });
}

function askToInstall() {
    rl.question('ffmpeg is not installed. Would you like to install it? ([y]es/[n]o): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            installFfmpeg();
        } else {
            console.log('You cannot continue as ffmpeg is required.');
            rl.close();
        }
    });
}

function installFfmpeg() {
    const platform = os.platform();

    switch (platform) {
        case 'win32':
            installOnWindows();
            break;
        case 'darwin':
            installOnMac();
            break;
        case 'linux':
            installOnLinux();
            break;
        default:
            console.log('Unsupported platform');
            rl.close();
    }
}

function installOnWindows() {
    // Check if winget is available
    exec('winget --version', (err, stdout, stderr) => {
        if (!err) {
            console.log('Installing ffmpeg using winget...');
            exec('winget install Gyan.FFmpeg', (installErr, installStdout, installStderr) => {
                if (installErr) {
                    console.log('Failed to install ffmpeg using winget.');
                    openBrowser();
                } else {
                    console.log('ffmpeg installed successfully!');
                    rl.close();
                }
            });
        } else {
            console.log('winget is not found. Opening installation page...');
            openBrowser();
        }
    });
}

function installOnMac() {
    exec('brew --version', (err, stdout, stderr) => {
        if (!err) {
            console.log('Installing ffmpeg using Homebrew...');
            exec('brew install ffmpeg', (installErr, installStdout, installStderr) => {
                if (installErr) {
                    console.log('Failed to install ffmpeg using Homebrew.');
                } else {
                    console.log('ffmpeg installed successfully!');
                }
                rl.close();
            });
        } else {
            console.log('Homebrew is not installed. Please install Homebrew and try again.');
            rl.close();
        }
    });
}

function installOnLinux() {
    console.log('Installing ffmpeg using apt-get...');
    exec('sudo apt-get install ffmpeg', (err, stdout, stderr) => {
        if (err) {
            console.log('Failed to install ffmpeg using apt-get.');
        } else {
            console.log('ffmpeg installed successfully!');
        }
        rl.close();
    });
}

function openBrowser() {
    const { exec } = require('child_process');
    exec('start https://ffmpeg.org/download.html', (err, stdout, stderr) => {
        if (err) {
            console.log('Could not open web browser.');
        }
        rl.close();
    });
}

// Run the check
checkFfmpeg();
