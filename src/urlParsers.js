/**
 * Parses and transforms a given URL by replacing a segment of the path.
 *
 * @param {string} originalUrl - The original URL to be parsed and transformed.
 * @param {string} replacementSegment - The segment to replace in the URL path.
 * @returns {string|null} - The transformed URL or null if an error occurs.
 */
export function parseAndTransformUrl(originalUrl, replacementSegment) {
    try {
        const { origin, pathname } = new URL(originalUrl);
        return origin + pathname.split('/').slice(0, -4).join('/') + '/range/avf/' + replacementSegment.split('&range')[0];
    } catch (e) {
        console.error("Error parsing URL:", e);
        return null;
    }
}

/**
 * Retrieves the URL of a video segment from the provided data.
 *
 * @param {Object} data - The data object containing video information.
 * @param {boolean} [maxResolution=false] - If true, selects the video with the highest resolution.
 * @param {number|null} [resolution=null] - The specific resolution height to match. Ignored if maxResolution is true.
 * @returns {string|null} - The URL of the video segment, or null if not found.
 * @throws Will throw an error if no video data is available.
 */
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

/**
 * Extracts the URL of the audio segment from the provided data.
 *
 * @param {Object} data - The data object containing audio information.
 * @param {Array} data.audio - An array of audio objects.
 * @param {string} data.audio[].codecs - The codec type of the audio.
 * @param {Array} data.audio[].segments - An array of segments for the audio.
 * @param {Object} data.audio[].segments[].url - The URL of the audio segment.
 * @returns {string|null} - The URL of the audio segment if found, otherwise null.
 */
export function getAudioUrl(data) {
    try {
        const audio = data?.audio?.find(a => a.codecs === 'mp4a.40.2');
        return audio?.segments[0]?.url || null;
    } catch (e) {
        console.error("Error fetching audio URL:", e);
        return null;
    }
}
