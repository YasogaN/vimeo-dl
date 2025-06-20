import axios from "axios";
import puppeteer from "puppeteer";
import fs from 'fs/promises';

/**
 * Asynchronously loads a playlist from the given URL.
 *
 * @param {string} url - The URL of the playlist to load.
 * @returns {Promise<Object>} A promise that resolves to the playlist data.
 * @throws Will throw an error if the playlist cannot be loaded.
 */
export async function loadPlaylist(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (e) {
        console.error("Error loading playlist:", e.message || e);
        throw "Failed to load playlist. Please verify the URL and try again.";
    }
}

/**
 * Parses a cookie object and returns a standardized cookie representation.
 *
 * @param {Object} cookie - The cookie object to parse.
 * @param {string} [cookie.domain] - The domain of the cookie.
 * @param {number} [cookie.expirationDate] - The expiration date of the cookie as a timestamp.
 * @param {boolean} [cookie.httpOnly] - Indicates if the cookie is HTTP only.
 * @param {string} cookie.name - The name of the cookie.
 * @param {Object} [cookie.partitionKey] - The partition key of the cookie.
 * @param {string} [cookie.path] - The path of the cookie.
 * @param {string} [cookie.priority] - The priority of the cookie.
 * @param {boolean} [cookie.sameParty] - Indicates if the cookie is same party.
 * @param {string} [cookie.sameSite] - The same site policy of the cookie.
 * @param {boolean} [cookie.secure] - Indicates if the cookie is secure.
 * @param {string} [cookie.sourceScheme] - The source scheme of the cookie.
 * @param {string} [cookie.url] - The URL associated with the cookie.
 * @param {string} cookie.value - The value of the cookie.
 * @returns {Object} The standardized cookie representation.
 */
function parseCookie(cookie) {
    return {
        domain: cookie.domain || undefined,
        expires: cookie.expirationDate || undefined,
        httpOnly: cookie.httpOnly || undefined,
        name: cookie.name,
        partitionKey: cookie.partitionKey || undefined,
        path: cookie.path || undefined,
        priority: cookie.priority || undefined,
        sameParty: cookie.sameParty || undefined,
        sameSite: cookie.sameSite || undefined,
        secure: cookie.secure || undefined,
        sourceScheme: cookie.sourceScheme || undefined,
        url: cookie.url || undefined,
        value: cookie.value
    };
}

const delay = (time) => new Promise(res => setTimeout(res, time));

/**
 * Loads a webpage and listens for playlist requests.
 * Requires user-provided cookies for authenticated content.
 *
 * @param {string} url - The URL of the webpage to load.
 * @param {string|null} [cookiesPath=null] - The path to a JSON file containing cookies to set, or null if no cookies should be set.
 * @returns {Promise<string|null>} - A promise that resolves to the found playlist URL if available, or null if not.
 *
 * @throws {Error} - Throws an error if the cookies file cannot be read or parsed.
 */
export async function loadWebpage(url, cookiesPath = null) {
    const cookies = cookiesPath ? JSON.parse(await fs.readFile(cookiesPath)).map(parseCookie) : null;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    if (cookies) await page.setCookie(...cookies);

    let foundURL = null;
    page.on('request', req => {
        const reqUrl = req.url();
        // Look for playlist.json requests without hardcoding platform specifics
        if (reqUrl.includes('/playlist.json') || reqUrl.includes('playlist')) {
            foundURL = reqUrl;
            console.log('Found playlist URL (sanitized): [PLAYLIST_URL_FOUND]');
            browser.close();
        }
    });

    await page.goto(url);
    await page.waitForFunction(() => {
        const iframes = Array.from(document.querySelectorAll('iframe'));
        return iframes.every(iframe => {
            try {
                return iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete';
            } catch (e) {
                // Cross-origin iframes may throw; consider them loaded
                return true;
            }
        });
    });
    await delay(5000);
    return foundURL;
}

export async function printDisclaimer() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                LEGAL DISCLAIMER                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ This tool is provided for PERSONAL, EDUCATIONAL, and ARCHIVAL purposes only. ║
║                                                                              ║
║ YOU ARE RESPONSIBLE FOR:                                                     ║
║ • Complying with all applicable copyright laws                               ║
║ • Respecting content creators' rights                                        ║
║ • Following the platform's Terms of Service                                  ║
║ • Ensuring you have proper authorization to download content                 ║
║                                                                              ║
║ This software does NOT bypass DRM or access encrypted content.               ║
║ Use at your own risk and responsibility.                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
}