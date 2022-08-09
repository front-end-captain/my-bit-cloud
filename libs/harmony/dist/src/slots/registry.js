"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRegistry = void 0;
class SlotRegistry {
    constructor(registerFn, map = new Map()) {
        this.registerFn = registerFn;
        this.map = map;
    }
    /**
     * get a slot value by extension id.
     */
    get(id) {
        return this.map.get(id);
    }
    /**
     * return an array of all slots.
     */
    toArray() {
        return Array.from(this.map.entries());
    }
    /**
     * get all registered values.
     */
    values() {
        return Array.from(this.map.values());
    }
    /**
     * register a new entry to the slot registry
     */
    register(value) {
        const id = this.registerFn();
        this.map.set(id, value);
    }
}
exports.SlotRegistry = SlotRegistry;