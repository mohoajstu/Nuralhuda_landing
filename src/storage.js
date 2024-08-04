export class LocalStorageStrategy {
    load(key) {
      const item = localStorage.getItem(key);
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    }
  
    save(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
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
  