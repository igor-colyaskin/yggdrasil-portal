sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/epic/yggdrasil/staffportal/model/formatter",
    "sap/ui/model/json/JSONModel",
    "com/epic/yggdrasil/staffportal/lib/sdkcard/StorageUtils" // Подключаем утилиты
], function (Controller, formatter, JSONModel, StorageUtils) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.shell.Shell", {
        onInit: function () {
            this._setupHostCommunication()
            this._initPortalCards()
        },

        _setupHostCommunication: function () {
            const oHost = this.getOwnerComponent().getHost()

            oHost.subscribeEvent("Navigation_TabChanged", (oEvent) => {
                const sTabKey = oEvent.getParameter("tabKey")

                // 1. Синхронизируем состояние и Storage
                this.getOwnerComponent().getHost().setContext({ currentTab: sTabKey })

                // 2. Лениво догружаем карточки для этой табы (если их там еще нет)
                this._loadCardsByTab(sTabKey)
            }, this)
        },

        // _initPortalCards: function () {
        //     const oHost = this.getOwnerComponent().getHost()
        //     const oMainModel = this.getOwnerComponent().getModel()
        //     const oUiModel = this.getOwnerComponent().getModel("ui")

        //     oUiModel.getProperty("/cards").forEach(oConf => {
        //         const oContainer = this.getView().byId(oConf.containerId)
        //         if (oContainer) {
        //             oContainer.destroyItems()
        //             // Форсируем передачу модели из Shell (Компонента) в Карточку
        //             oContainer.setModel(oMainModel)
        //             // И не забываем про модель UI (где лежит currentTab)
        //             oContainer.setModel(oUiModel, "ui")

        //             const oCard = new sap.ui.integration.widgets.Card({
        //                 id: this.getView().createId(oConf.id),
        //                 manifest: oConf.manifest,
        //                 host: oHost
        //             })
        //             oContainer.addItem(oCard)
        //         }
        //     })
        // }
        // В Shell.controller.js

        _initPortalCards: function () {
            const oUiModel = this.getOwnerComponent().getModel("ui")
            const aCards = oUiModel.getProperty("/cards") || []

            // 1. Сначала грузим всю статику (Header, Nav)
            aCards.filter(c => c.loadType === "static").forEach(c => this._loadCardById(c.id))

            // 2. Затем грузим то, что должно быть открыто прямо сейчас (из Storage)
            const sCurrentTab = oUiModel.getProperty("/currentTab")
            this._loadCardsByTab(sCurrentTab)
        },

        /**
         * Загрузка всех динамических карточек для конкретной табы
         */
        _loadCardsByTab: function (sTabKey) {
            const aCards = this.getOwnerComponent().getModel("ui").getProperty("/cards") || []

            aCards.filter(c => {
                if (c.loadType !== "dynamic") return false
                // Проверяем, подходит ли таба (с учетом того, что tab может быть массивом)
                return Array.isArray(c.tab) ? c.tab.includes(sTabKey) : c.tab === sTabKey
            }).forEach(c => this._loadCardById(c.id))
        },

        /**
         * Атомарный метод загрузки одной карточки
         */
        _loadCardById: function (sCardId) {
            const oView = this.getView()
            const oConf = oView.getModel("ui").getProperty("/cards").find(c => c.id === sCardId)
            const oContainer = oView.byId(oConf.containerId)

            // Если контейнер есть и он пуст — создаем карточку
            if (oContainer && oContainer.getItems().length === 0) {
                const oCard = new sap.ui.integration.widgets.Card({
                    id: oView.createId(oConf.id),
                    manifest: oConf.manifest,
                    host: this.getOwnerComponent().getHost()
                })

                // Прокидываем модели для биндингов visible и прочего
                oContainer.setModel(this.getOwnerComponent().getModel())
                oContainer.setModel(oView.getModel("ui"), "ui")

                oContainer.addItem(oCard)
                console.log(`✅ [Shell]: Loaded ${oConf.loadType} card -> ${sCardId}`)
            }
        }
    })
})