class ReduxManagerClass {
    constructor() {
        this.store = undefined;
        this.reducers = undefined;
    }

    setStore(store) {
        this.store = store;
    }

    getStore() {
        return this.store;
    }
}

export const ReduxManager = new ReduxManagerClass();
