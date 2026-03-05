"use strict";

/**
 * Simple in-memory cache with per-entry TTL.
 *
 * Usage:
 *   const cache = new CacheService({ ttl: 30000 });
 *   cache.set("key", value);
 *   cache.get("key");          // value (or undefined if expired)
 *   cache.has("key");          // true / false
 *   cache.delete("key");
 *   cache.clear();
 *
 * Expired entries are lazily evicted on access.
 */
class CacheService {

    /**
     * @param {Object} [options]
     * @param {Number} [options.ttl=30000] Default TTL in milliseconds
     */
    constructor(options = {}) {
        this._ttl = options.ttl || 30000;
        /** @type {Map<string, {value: any, expiresAt: number}>} */
        this._store = new Map();
    }

    /**
     * Get a cached value. Returns undefined if missing or expired.
     * @param {String} key
     * @return {*} Cached value or undefined
     */
    get(key) {
        const entry = this._store.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this._store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    /**
     * Store a value with optional custom TTL.
     * @param {String} key
     * @param {*} value
     * @param {Number} [ttl] Override default TTL (ms)
     */
    set(key, value, ttl) {
        const effectiveTtl = typeof ttl === "number" ? ttl : this._ttl;
        this._store.set(key, {
            value: value,
            expiresAt: Date.now() + effectiveTtl
        });
    }

    /**
     * Check if a non-expired entry exists.
     * @param {String} key
     * @return {Boolean}
     */
    has(key) {
        return this.get(key) !== undefined;
    }

    /**
     * Remove a single entry.
     * @param {String} key
     */
    delete(key) {
        this._store.delete(key);
    }

    /**
     * Remove all entries.
     */
    clear() {
        this._store.clear();
    }

    /**
     * Invalidate all entries whose key starts with the given prefix.
     * Useful for clearing resource-specific caches (e.g., "organizations:*").
     * @param {String} prefix
     */
    invalidateByPrefix(prefix) {
        for (const key of this._store.keys()) {
            if (key.startsWith(prefix)) {
                this._store.delete(key);
            }
        }
    }

    /**
     * Number of (possibly expired) entries in cache.
     * @return {Number}
     */
    get size() {
        return this._store.size;
    }
}

module.exports = CacheService;
