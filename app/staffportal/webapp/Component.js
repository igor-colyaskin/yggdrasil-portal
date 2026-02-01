sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/integration/Host",
    "sap/ui/base/EventProvider",
    "sap/ui/model/json/JSONModel",
    "com/epic/nebula/lib/sdkcard/StorageUtils"
], function (UIComponent, Host, EventProvider, JSONModel, StorageUtils) {
    "use strict"

    return UIComponent.extend("com.epic.nebula.Component", {
        metadata: { manifest: "json" },

        init: function () {
            // 1. Сначала создаем модель состояния, чтобы Хост мог с ней работать
            const oUiModel = new JSONModel({
                currentRole: "",
                currentTab: "home",
                currentRoleConfig: { navigation: [] }
            })
            this.setModel(oUiModel, "ui")

            // 2. Инициализируем хранилище
            StorageUtils.createStorage("NEBULA_PORTAL_2026")

            // 3. Базовая инициализация UIComponent
            UIComponent.prototype.init.apply(this, arguments)

            // 4. Настройка Хоста
            this._setupNebulaHost()
        },

        _setupNebulaHost: function () {
            this._oHost = new Host("nebulaHost")
            // Используем загруженный EventProvider
            this._oResonator = new EventProvider()

            const oUiModel = this.getModel("ui")

            // --- Shared Context ---
            this._oHost.getContext = () => {
                return Promise.resolve(oUiModel.getData())
            }

            this._oHost.setContext = (mCtx) => {
                if (mCtx) {
                    Object.keys(mCtx).forEach(sKey => {
                        oUiModel.setProperty("/" + sKey, mCtx[sKey])

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