export function parseAndTransformUrl(originalUrl, replacementSegment) {
    try {
        const { origin, pathname } = new URL(originalUrl);
        return origin + pathname.split('/').slice(0, -4).join('/') + '/range/avf/' + replacementSegment.split('&range')[0];
    } catch (e) {
        console.error("Error parsing URL:", e);
        return null;
    }
}

export function getVideoUrl(data, maxResolution = false, resolution = null) {
    try {
        if (!data?.video?.length) throw "No video data";
        const video = maxResolution
            ? data.video.reduce((prev, curr) => (curr.width * curr.height > prev.width * prev.height ? curr : prev))
            : resolution && data.video.find(v => v.height == resolution);
        return video?.segments[0]?.url || null;
    } catch (e) {
        console.error("Error fetching video URL:", e);
        return null;
    }
}

export function getAudioUrl(data) {
    try {
        const audio = data?.audio?.find(a => a.codecs === 'mp4a.40.2');
        return audio?.segments[0]?.url || null;
    } catch (e) {
        console.error("Error fetching audio URL:", e);
        return null;
    }
}
