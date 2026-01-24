sap.ui.define(["sap/ui/util/Storage"], function (Storage) {
    "use strict"

    return {
        oStorage: null,

        createStorage: function (sStorageKeyPrefix) {
            this.oStorage = new Storage(Storage.Type.local, sStorageKeyPrefix)
        },

        setItem: function (key, value) {
            return this.oStorage ? this.oStorage.put(key, value) : null
        },

        readItem: function (key) {
            return this.oStorage ? this.oStorage.get(key) : null
        },

        removeItem: function (key) {
            return this.oStorage ? this.oStorage.remove(key) : false
        }
    }
})