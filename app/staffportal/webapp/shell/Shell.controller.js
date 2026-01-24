sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/epic/yggdrasil/staffportal/model/formatter",
    "sap/ui/model/json/JSONModel",
    "com/epic/yggdrasil/staffportal/lib/sdkcard/StorageUtils" // Подключаем утилиты
], function (Controller, formatter, JSONModel, StorageUtils) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.shell.Shell", {
        onInit: function () {
            // 1. Инициализируем хранилище
            StorageUtils.createStorage("YGG_PORTAL_2026")

            this._setupHostCommunication()
            this._initPortalCards()
        },

        _setupHostCommunication: function () {
            const oHost = this.getOwnerComponent().getHost()
            oHost.resolveDestination = (sName) => {
                const m = {
                    "hrService": "/odata/v4/hr",
                    "financeService": "/finance",
                    "projectService": "/odata/v4/projects"
                }
                return m[sName]
            }

            oHost.subscribeEvent("Navigation_TabChanged", (oEvent) => {
                const sTabKey = oEvent.getParameter("tabKey")
                this.getOwnerComponent().getModel("ui").setProperty("/currentTab", sTabKey)
            })
        },

        _initPortalCards: function () {
            const oHost = this.getOwnerComponent().getHost()
            const oMainModel = this.getOwnerComponent().getModel()
            const oUiModel = this.getOwnerComponent().getModel("ui")

            oUiModel.getProperty("/cards").forEach(oConf => {
                const oContainer = this.getView().byId(oConf.containerId)
                if (oContainer) {
                    oContainer.destroyItems()
                    // Форсируем передачу модели из Shell (Компонента) в Карточку
                    oContainer.setModel(oMainModel)
                    // И не забываем про модель UI (где лежит currentTab)
                    oContainer.setModel(oUiModel, "ui")
                    
                    const oCard = new sap.ui.integration.widgets.Card({
                        id: this.getView().createId(oConf.id),
                        manifest: oConf.manifest,
                        host: oHost
                    })
                    oContainer.addItem(oCard)
                }
            })
        }
    })
})