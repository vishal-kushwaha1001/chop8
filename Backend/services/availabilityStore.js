/**
 * Converted from: backendChop8.chef.ChefAvailabilityStore
 *
 * Holds chef availability purely in memory.
 * No database — resets to "unavailable" on server restart.
 *
 * Java used ConcurrentHashMap with compute() for atomic toggle.
 * Node.js is single-threaded so a plain Map is safe — no race conditions.
 */
const store = new Map();

const availabilityStore = {
  /** Returns true only if the chef has explicitly toggled themselves available. */
  isAvailable(chefId) {
    return store.get(String(chefId)) === true;
  },

  /** Flips availability and returns the new value. */
  toggle(chefId) {
    const key     = String(chefId);
    const current = store.get(key) === true;
    const next    = !current;
    store.set(key, next);
    return next;
  },

  /** Explicit setter — useful for admin overrides. */
  set(chefId, available) {
    store.set(String(chefId), Boolean(available));
  },
};

module.exports = availabilityStore;
