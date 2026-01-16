import { computed, ref, watch } from "vue";
import { DEFAULT_SPOOLMAN_URL } from "../api/spoolman";

const STORAGE_KEY = "spoolman-url";
const hasWindow = typeof window !== "undefined";

const readStored = () => {
    if (!hasWindow) return DEFAULT_SPOOLMAN_URL;
    
    // Check for URL in query string first (surl parameter)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryUrl = urlParams.get('surl');
        if (queryUrl && queryUrl.trim().length > 0) {
            // Normalize and save the URL from query string
            const normalized = normalizeUrl(queryUrl);
            // Save it to localStorage so it persists
            window.localStorage.setItem(STORAGE_KEY, normalized);
            return normalized;
        }
    } catch (err) {
        console.warn("Could not read URL from query string", err);
    }
    
    // Fall back to localStorage
    try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return value && value.trim().length > 0 ? value : DEFAULT_SPOOLMAN_URL;
    } catch (err) {
        console.warn("Could not read spoolman url from storage", err);
        return DEFAULT_SPOOLMAN_URL;
    }
};

const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    // If no scheme provided, assume http.
    if (!/^https?:\/\//i.test(trimmed)) {
        return `http://${trimmed}`;
    }
    return trimmed;
};

const spoolmanUrl = ref<string>(readStored());

watch(spoolmanUrl, (value) => {
    persist(value);
});

const persist = (value: string) => {
    if (!hasWindow) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
        console.warn("Could not persist spoolman url", err);
    }
};

const setSpoolmanUrl = (value: string) => {
    const next = normalizeUrl(value);
    spoolmanUrl.value = next;
    persist(next);
};

const resetSpoolmanUrl = () => {
    setSpoolmanUrl(DEFAULT_SPOOLMAN_URL);
};

const resolvedBaseUrl = computed(() => {
    // If the target is spoolman.disane.dev, use the local dev proxy to avoid CORS.
    try {
        const url = new URL(spoolmanUrl.value);
        if (url.hostname === "spoolman.disane.dev") {
            return "/spoolman";
        }
    } catch (err) {
        // fall through to direct value
    }
    return spoolmanUrl.value;
});

const hasUrl = computed(() => {
    return spoolmanUrl.value.trim().length > 0;
});

export const useSpoolmanUrl = () => ({
    spoolmanUrl,
    resolvedBaseUrl,
    hasUrl,
    setSpoolmanUrl,
    resetSpoolmanUrl,
});
