export function parseAndTransformUrl(originalUrl, replacementSegment) {
    try {
        const url = new URL(originalUrl);
        const pathSegments = url.pathname.split('/').slice(0, -4).join('/') + '/range/avf/' + replacementSegment.split('&range')[0];
        return url.origin + pathSegments;
    } catch (error) {
        console.error("Error parsing or transforming the URL:", error);
        return null;
    }
}

export function getVideoUrl(data, maxResolution = false, resolution = null) {
    try {
        if (!data?.video?.length) throw new Error("No video data available");

        const video = maxResolution
            ? data.video.reduce((prev, curr) => (curr.width * curr.height > prev.width * prev.height ? curr : prev))
            : resolution && data.video.find(item => item.height == resolution);

        if (!video) throw new Error("No video found with the required resolution or max resolution");
        const videoUrl = video?.segments[0]?.url;
        if (!videoUrl) throw new Error("No video URL found in the segments");

        return videoUrl;
    } catch (error) {
        console.error("Error getting video URL:", error);
        return null;
    }
}

export function getAudioUrl(data) {
    try {
        if (!data?.audio?.length) throw new Error("No audio data available");

        const audio = data.audio.find(item => item.codecs === 'mp4a.40.2');
        if (!audio) throw new Error("No audio found with the required codec");

        const audioUrl = audio?.segments[0]?.url;
        if (!audioUrl) throw new Error("No audio URL found in the segments");

        return audioUrl;
    } catch (error) {
        console.error("Error getting audio URL:", error);
        return null;
    }
}
