sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/epic/yggdrasil/staffportal/model/formatter",
    "sap/ui/model/json/JSONModel"
], function (Controller, formatter, JSONModel) {
    "use strict"

    // Конфигурация карточек портала
    const CARD_CONFIG = [
        { id: "headerCard", containerId: "headerSection", manifest: "./cards/HeaderCard/manifest.json" },
        { id: "navCard", containerId: "navSection", manifest: "./cards/NavCard/manifest.json" },
        { id: "staffTableCard", containerId: "staffTableContainer", manifest: "./cards/StaffTable/manifest.json" }
    ]

    return Controller.extend("com.epic.yggdrasil.staffportal.shell.Shell", {
        formatter: formatter,

        onInit: function () {
            // 1. Инициализация локального состояния UI
            const oViewState = new JSONModel({
                currentTab: "staff"
            })
            this.getView().setModel(oViewState, "viewState")

            // 2. Настройка инфраструктуры через Хост
            this._setupHostCommunication()

            // 3. Запуск фабрики карточек
            this._initPortalCards()
        },

        /**
         * Настройка взаимодействия с Хостом и подписки на события
         */
        _setupHostCommunication: function () {
            const oHost = this.getOwnerComponent().getHost()

            // Резолвер адресов сервисов (Destinations)
            oHost.resolveDestination = (sName) => {
                const mDestinations = {
                    "hrService": "/odata/v4/hr",
                    "financeService": "/finance",
                    "projectService": "/odata/v4/projects"
                }
                return mDestinations[sName]
            }

            // Подписка на навигацию через Резонантор
            oHost.subscribeEvent("Navigation_TabChanged", (oEvent) => {
                const sTabKey = oEvent.getParameter("tabKey")
                this.getView().getModel("viewState").setProperty("/currentTab", sTabKey)
            })
        },

        /**
         * Фабрика создания и размещения карточек
         */
        _initPortalCards: function () {
            const oHost = this.getOwnerComponent().getHost()
            const oView = this.getView()

            CARD_CONFIG.forEach(oConf => {
                const oContainer = oView.byId(oConf.containerId)
                if (!oContainer) {
                    return
                }

                oContainer.destroyItems()

                // Создание экземпляра интеграционной карточки
                const oCard = new sap.ui.integration.widgets.Card({
                    id: oView.createId(oConf.id),
                    manifest: oConf.manifest,
                    host: oHost
                })

                oContainer.addItem(oCard)
            })
        }
    })
})