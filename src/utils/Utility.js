// Utility.js

/**
 * Open a new window with the given url.
 * @param {String} url 
 */
export function goToLink(url) {
    window.open(url,"_blank",null);
}

/**
 * Calculates if the text color should rather be black or white 
 * depending on the background color.
 * @param {String} bgColor Hexadecimal color code
 * @returns "black" or "white"
 */
export function getTextColor(bgColor) {
    // Convert hex color to RGB
    const rgb = bgColor.match(/\w\w/g).map(hex => parseInt(hex, 16));
    // Calculate relative luminance
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    // Return black for bright backgrounds, white for dark
    return luminance > 0.5 ? "black" : "white";
}