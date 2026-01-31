sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/integration/Host",
    "sap/ui/base/EventProvider",
    "sap/ui/model/json/JSONModel",
    "com/epic/nebula/lib/sdkcard/StorageUtils"
], function (UIComponent, Host, EventProvider, JSONModel, StorageUtils) {
    "use strict"

    return UIComponent.extend("com.epic.nebula.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // 1. Инициализируем хранилище NEBULA_CORE
            StorageUtils.createStorage("NEBULA_PORTAL_2026")

            // 2. Базовая инициализация
            UIComponent.prototype.init.apply(this, arguments)

            // 3. Настройка Хоста (Инфраструктура Галактики)
            this._setupNebulaHost()
        },

        _setupNebulaHost: function () {
            // Создаем Хост, через который карточки будут общаться с порталом
            this._oHost = new Host("nebulaHost")
            this._oResonator = new EventProvider()

            // Эфирный Резонантор (PubSub)
            this._oHost.publishEvent = (sName, oData) => {
                this._oResonator.fireEvent(sName, oData)
            }

            this._oHost.subscribeEvent = (sName, fnCallback, oListener) => {
                this._oResonator.attachEvent(sName, fnCallback, oListener)
            }

            // Централизованный резолвер адресов (на будущее для CAP)
            this._oHost.resolveDestination = (sName) => {
                const mDestinations = {
                    "configService": "/portal-config",
                    "dataService": "/odata/v4/main"
                }
                return mDestinations[sName] || ""
            }
        },

        getHost: function () {
            return this._oHost
        }
    })
})