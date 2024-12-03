import axios from "axios";
import puppeteer from "puppeteer";
import fs from 'fs/promises';

export async function loadPlaylist(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (e) {
        console.error("Error loading playlist:", e.message || e);
        throw "Failed to load playlist. Please try again.";
    }
}

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