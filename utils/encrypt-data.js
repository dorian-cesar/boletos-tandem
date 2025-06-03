import CryptoJS from "crypto-js";

export function encryptData(data, key, live_time = null) {
    live_time && Object.assign(data, { live_time: live_time })
    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    localStorage.setItem(key, encrypted);
}

export function encryptDataNoTime(data, key) {
    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    localStorage.setItem(key, encrypted);
}

export function encryptDataNoSave(data, key) {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    const encodedData = encodeURIComponent(encryptedData);
    return encodedData;
}

export function decryptDataNoSaved(data, key) {
    try {
        const decodedData = decodeURIComponent(data);
        let decrypted = CryptoJS.AES.decrypt(decodedData, key);
        const transformData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        return transformData;
    } catch (error) {
        console.error("Decryption failed:", error);
        return {};

    }
}

export function decryptData(key) {
    let encrypted = localStorage.getItem(key);
    if (!encrypted) {
        return null;
    }
    let decrypted = CryptoJS.AES.decrypt(encrypted, key);
    const transformData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    if( transformData && transformData.live_time <= Date.now() ) {
        _deleteData(key);
        return null;
    }
    return transformData;
}

function _deleteData(key) {
    localStorage.removeItem(key);
}