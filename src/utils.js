import axios from "axios";
import puppeteer from "puppeteer";
import fs from 'fs/promises';

export async function loadPlaylist(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error loading playlist:", error.message || error);
        throw new Error("Failed to load the playlist. Please try again.");
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

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

export async function loadWebpage(url, cookies = null) {
    cookies = cookies ? JSON.parse(await fs.readFile(cookies)) : null;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    if (cookies) {
        cookies = cookies.map(parseCookie);
        await page.setCookie(...cookies);
    }
    let foundURL = null;
    page.on('request', (request) => {
        const requestUrl = request.url();
        if (requestUrl.includes('/v2/playlist/av/primary/playlist.json')) {
            foundURL = requestUrl;
            browser.close();
        }
    });
    await page.goto(url);
    await page.waitForFunction(() => {
        const vimeoIframe = document.querySelector('iframe[src*="vimeo.com"]');
        return vimeoIframe && vimeoIframe.contentWindow.document.readyState === 'complete';
    });
    await delay(5000);
    return foundURL;
}


