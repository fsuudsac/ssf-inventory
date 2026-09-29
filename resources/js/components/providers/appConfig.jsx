import CryptoJS from "crypto-js";
import dayjs from "dayjs";

export const {
    VITE_APP_NAME,
    VITE_APP_DESCRIPTION,
    VITE_APP_LOGO,
    VITE_APP_LOGO_FULLWIDTH,
    VITE_APP_ENCRYPT_KEY,
    VITE_APP_PRIMARY_COLOR,
    VITE_APP_SECONDARY_COLOR,
    VITE_APP_PUSHER_APP_ID,
    VITE_APP_PUSHER_APP_KEY,
    VITE_APP_PUSHER_APP_SECRET,
    VITE_APP_PUSHER_APP_CLUSTER,
    VITE_APP_PUSHER_APP_CHANNEL,
} = import.meta.env;

export const apiUrl = (url, api = window.location.origin) => `${api}/${url}`;

export const system_id = 12;
export const permissionStatus = true;

const sanitizeEnv = (val, fallback) => {
    if (!val || typeof val !== "string") return fallback;
    const trimmed = val.trim();
    if (trimmed.length <= 1 || trimmed === "a") return fallback;
    return trimmed;
};

export const appName = sanitizeEnv(VITE_APP_NAME, "FSUU PMO INVENTORY");
export const appDescription = sanitizeEnv(VITE_APP_DESCRIPTION, "FSUU PMO INVENTORY");
export const appLogo = apiUrl(sanitizeEnv(VITE_APP_LOGO, "images/logo.png"));
export const appLogoFullWidth = apiUrl(sanitizeEnv(VITE_APP_LOGO_FULLWIDTH, "images/logo_sidemenu.png"));
export const primaryColor =
    VITE_APP_PRIMARY_COLOR && VITE_APP_PRIMARY_COLOR.startsWith("#")
        ? VITE_APP_PRIMARY_COLOR
        : "#144F87";
export const secondaryColor =
    VITE_APP_SECONDARY_COLOR && VITE_APP_SECONDARY_COLOR.startsWith("#")
        ? VITE_APP_SECONDARY_COLOR
        : "#9ae9fd";
export const pusherAppId = sanitizeEnv(VITE_APP_PUSHER_APP_ID, "");
export const pusherAppKey = sanitizeEnv(VITE_APP_PUSHER_APP_KEY, "");
export const pusherAppSecret = sanitizeEnv(VITE_APP_PUSHER_APP_SECRET, "");
export const pusherAppCluster = sanitizeEnv(VITE_APP_PUSHER_APP_CLUSTER, "ap1");
export const pusherAppChannel = sanitizeEnv(VITE_APP_PUSHER_APP_CHANNEL, "fsuu-dsac-2024");

export const defaultProfile = apiUrl("images/default.png");
export const defaultDocument = apiUrl("images/documents.png");

export const ENCRYPT_BASE_KEY = "FSUU-DSAC-ADMIN-APPLICATION";

export const getEncryptKey = () => {
    const year = dayjs().format("YYYY");
    return `${ENCRYPT_BASE_KEY}-${year}`;
};

export const encrypt = (data) => {
    try {
        const text = typeof data === "string" ? data : JSON.stringify(data);
        return CryptoJS.AES.encrypt(text, getEncryptKey()).toString();
    } catch (e) {
        return typeof data === "string" ? data : JSON.stringify(data);
    }
};

export const decrypt = (data) => {
    if (!data) return null;
    if (typeof data !== "string") {
        try {
            return JSON.stringify(data);
        } catch {
            return null;
        }
    }

    const trimmed = data.trim();
    if (!trimmed) return null;

    // Fast return if it's already a raw JSON string
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return trimmed;
    }

    const currentYear = dayjs().format("YYYY");
    const numYear = Number(currentYear);
    const candidateKeys = [
        `${ENCRYPT_BASE_KEY}-${currentYear}`,
        ENCRYPT_BASE_KEY,
        `${ENCRYPT_BASE_KEY}-${numYear - 1}`,
        `${ENCRYPT_BASE_KEY}-${numYear + 1}`,
    ];

    if (
        VITE_APP_ENCRYPT_KEY &&
        VITE_APP_ENCRYPT_KEY !== "a" &&
        VITE_APP_ENCRYPT_KEY !== ENCRYPT_BASE_KEY
    ) {
        candidateKeys.unshift(`${VITE_APP_ENCRYPT_KEY}-${currentYear}`);
        candidateKeys.push(VITE_APP_ENCRYPT_KEY);
    }

    for (const key of candidateKeys) {
        try {
            const bytes = CryptoJS.AES.decrypt(trimmed, key);
            // In CryptoJS, malformed bytes will throw when converted to UTF-8
            const text = bytes.toString(CryptoJS.enc.Utf8);
            if (text && text.length > 0) {
                if (text.startsWith("{") || text.startsWith("[")) {
                    return text;
                }
                try {
                    JSON.parse(text);
                    return text;
                } catch {
                    // Try next key if JSON parse verification fails
                }
            }
        } catch {
            // Silently suppress malformed UTF-8 exceptions and try next key
        }
    }

    // Fallback: check if the string itself was parseable JSON
    try {
        JSON.parse(trimmed);
        return trimmed;
    } catch {
        return null;
    }
};

export const clearLocalStorage = () => {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("userdata");
    } catch (e) {
        console.warn("Could not clear localStorage:", e);
    }
};

export const token = () => {
    try {
        const tokenVal = localStorage.getItem("token");
        if (!tokenVal) {
            return false;
        }
        return `Bearer ${tokenVal}`;
    } catch {
        return false;
    }
};

export const userData = () => {
    try {
        const encryptedUserData = localStorage.getItem("userdata");
        if (!encryptedUserData) {
            return false;
        }
        const decryptedData = decrypt(encryptedUserData);
        if (!decryptedData) {
            // Corrupted or undecryptable cached data; clean it up safely
            try {
                localStorage.removeItem("userdata");
            } catch {}
            return false;
        }
        return JSON.parse(decryptedData);
    } catch (e) {
        try {
            localStorage.removeItem("userdata");
        } catch {}
        return false;
    }
};

export const role = () => {
    const user = userData();
    return user ? user.role : null;
};
