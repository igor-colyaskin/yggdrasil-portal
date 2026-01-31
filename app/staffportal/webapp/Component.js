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
            // 1. Создаем Хост с фиксированным ID для глобального поиска
            this._oHost = new Host("nebulaHost")
            this._oResonator = new sap.ui.base.EventProvider()

            const oUiModel = this.getModel("ui")

            // --- Shared Context: Мост между Хостом и моделью UI ---
            this._oHost.getContext = () => {
                // Возвращаем промис с данными всей модели "ui"
                return Promise.resolve(oUiModel.getData())
            }

            this._oHost.setContext = (mCtx) => {
                if (mCtx) {
                    Object.keys(mCtx).forEach(sKey => {
                        oUiModel.setProperty("/" + sKey, mCtx[sKey])

                        // Persistence logic (как у тебя была)
                        const aPersistentKeys = ["selectedEmployeeID", "currentTab"]
                        if (aPersistentKeys.includes(sKey)) {
                            const sStorageKey = sKey === "selectedEmployeeID" ? "selectedID" : sKey
                            StorageUtils.setItem(sStorageKey, mCtx[sKey])
                        }
                    })
                    this._oHost.fireEvent("configurationChange")
                }
            }

            // --- PubSub: Эфирный Резонантор ---
            this._oHost.publishEvent = (sName, oData) => {
                this._oResonator.fireEvent(sName, oData)
            }

            this._oHost.subscribeEvent = (sName, fnCallback, oListener) => {
                this._oResonator.attachEvent(sName, fnCallback, oListener)
            }

            // --- Resolver: Пути к сервисам ---
            this._oHost.resolveDestination = (sName) => {
                const mDestinations = {
                    "hrService": "/odata/v4/hr",
                    "financeService": "/finance",
                    "projectService": "/odata/v4/projects"
                }
                return mDestinations[sName] || ""
            }
        },
        getHost: function () {
            return this._oHost
        }
    })
})