function encodeRFC(str) {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
}

function encodeBase64(str) {
    return Buffer.from(str).toString('base64');
}

module.exports = {
    encodeRFC,
    encodeBase64,
};