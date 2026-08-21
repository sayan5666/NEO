const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const SESSION_CACHE_TTL = parseInt(process.env.SESSION_CACHE_TTL || '7200', 10); // 2 hours

let redisClient = null;
let redisSubscriber = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully to', REDIS_URL);
    });

    redisClient.on('error', (err) => {
      console.warn('[Redis Error]', err.message);
    });

    redisClient.connect().catch((err) => {
      console.warn('[Redis] Connection warning (running in offline/mock mode if no server):', err.message);
    });
  }
  return redisClient;
};

const getRedisSubscriber = () => {
  if (!redisSubscriber) {
    redisSubscriber = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redisSubscriber.on('connect', () => {
      console.log('[Redis Subscriber] Connected for Pub/Sub');
    });

    redisSubscriber.on('error', (err) => {
      console.warn('[Redis Subscriber Error]', err.message);
    });

    redisSubscriber.connect().catch((err) => {
      console.warn('[Redis Subscriber] Connection warning:', err.message);
    });
  }
  return redisSubscriber;
};

/**
 * Cache active interview session state in Redis with 2-hour TTL
 * Key: interview:<sessionId>:state
 */
const cacheSessionState = async (sessionId, stateData, ttl = SESSION_CACHE_TTL) => {
  try {
    const client = getRedisClient();
    const key = `interview:${sessionId}:state`;
    await client.set(key, JSON.stringify(stateData), 'EX', ttl);
    return true;
  } catch (err) {
    console.warn(`[Redis Cache Warning] Failed to cache state for session ${sessionId}:`, err.message);
    return false;
  }
};

/**
 * Retrieve active interview session state from Redis cache
 */
const getCachedSessionState = async (sessionId) => {
  try {
    const client = getRedisClient();
    const key = `interview:${sessionId}:state`;
    const cached = await client.get(key);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (err) {
    console.warn(`[Redis Cache Warning] Failed to retrieve state for session ${sessionId}:`, err.message);
    return null;
  }
};

/**
 * Invalidate cached session state (e.g. upon completion or abort)
 */
const invalidateSessionState = async (sessionId) => {
  try {
    const client = getRedisClient();
    const key = `interview:${sessionId}:state`;
    await client.del(key);
    return true;
  } catch (err) {
    console.warn(`[Redis Cache Warning] Failed to delete cache for session ${sessionId}:`, err.message);
    return false;
  }
};

module.exports = {
  getRedisClient,
  getRedisSubscriber,
  cacheSessionState,
  getCachedSessionState,
  invalidateSessionState,
  SESSION_CACHE_TTL,
};
