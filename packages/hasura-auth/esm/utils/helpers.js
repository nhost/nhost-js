export const isBrowser = () => typeof window !== "undefined";
export class inMemoryLocalStorage {
    constructor() {
        this.memory = {};
    }
    setItem(key, value) {
        this.memory[key] = value;
    }
    getItem(key) {
        return this.memory[key];
    }
    removeItem(key) {
        delete this.memory[key];
    }
}
//# sourceMappingURL=helpers.js.map
