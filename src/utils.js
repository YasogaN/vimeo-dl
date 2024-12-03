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
        throw "Failed to load playlist. Please try again.";
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
 * Loads a webpage and listens for a specific request URL.
 *
 * @param {string} url - The URL of the webpage to load.
 * @param {string|null} [cookiesPath=null] - The path to a JSON file containing cookies to set, or null if no cookies should be set.
 * @returns {Promise<string|null>} - A promise that resolves to the found URL if the specific request is made, or null if not.
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
        if (reqUrl.includes('/v2/playlist/av/primary/playlist.json')) {
            foundURL = reqUrl;
            browser.close();
        }
    });

    await page.goto(url);
    await page.waitForFunction(() => {
        const iframe = document.querySelector('iframe[src*="vimeo.com"]');
        return iframe?.contentWindow?.document.readyState === 'complete';
    });
    await delay(5000);
    return foundURL;
}