/**
 * Optimizes Cloudinary image URLs
 * @param {string} url - The original image URL
 * @param {number} width - Target width for resize
 * @returns {string} - The optimized URL
 */
export const getOptimizedImageUrl = (url, width) => {
    if (!url) return '';
    if (!url.includes('cloudinary.com')) return url; // Return original if not cloudinary

    // Check if it's already an optimized URL to avoid double injection
    if (url.includes('f_auto,q_auto')) return url;

    // Insert transformation parameters
    // We look for 'upload/' which is standard in Cloudinary URLs
    const uploadIndex = url.indexOf('upload/');
    if (uploadIndex === -1) return url;

    const prefix = url.slice(0, uploadIndex + 7); // '...upload/'
    const suffix = url.slice(uploadIndex + 7); // 'rest/of/url'

    const transformation = `f_auto,q_auto,w_${width || 'auto'},c_limit`; // c_limit prevents upscaling blur

    return `${prefix}${transformation}/${suffix}`;
};
