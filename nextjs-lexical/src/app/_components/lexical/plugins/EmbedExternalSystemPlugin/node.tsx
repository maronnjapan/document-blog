
const tweetRegex = /^https?:\/\/(?:www\.)?twitter\.com\/(?:#!\/)?(?:\w+)\/status(?:es)?\/(\d+)$/i;
export const $isTweetUrl = (url: string) => tweetRegex.test(url)
export const $getTweetId = (url: string) => {
    const match = url.match(tweetRegex);
    return match ? match[1] : null;
}

const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?(?:\S+)?(\S{11})(?:\S+)?$/i;
export const $isYoutubeUrl = (url: string) => youtubeRegex.test(url)
export const $getYoutubeVideoId = (url: string) => {
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
}

const figmaRegex = /^https:\/\/(?:www\.)?figma\.com\/(?:file|proto|design)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/i;
export const $isFigmaUrl = (url: string) => figmaRegex.test(url)
export const $getFigmaId = (url: string) => {
    const match = url.match(figmaRegex);
    return match ? match[1] : null;
}
