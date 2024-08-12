export class LocalStorageStrategy {
    load(key) {
        return localStorage.getItem(key);
    }
    
    save(key, value) {
        localStorage.setItem(key, value);
    }
}

export class StorageManager {
    constructor(strategy) {
        this.strategy = strategy;
    }

    load(key) {
        return this.strategy.load(key);
    }

    save(key, value) {
        this.strategy.save(key, value);
    }
}
