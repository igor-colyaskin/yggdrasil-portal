sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/epic/yggdrasil/staffportal/model/formatter",
    "sap/ui/model/json/JSONModel"
], function (Controller, formatter, JSONModel) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.shell.Shell", {
        formatter: formatter,

        onInit: function () {
            // Создаем локальную модель видимости для Шелла
            const oViewState = new JSONModel({
                currentTab: "staff"
            })
            this.getView().setModel(oViewState, "viewState")

            const oHost = this.getOwnerComponent().getHost()

            // Ищем карточку по ID
            const oHeaderCard = this.getView().byId("headerCard")

            if (oHeaderCard) {
                // Прикручиваем магию Хоста к карточке
                oHeaderCard.setHost(oHost)
                console.log("🔗 Связь установлена: HeaderCard <-> epicHost")
            }

            oHost.subscribeEvent("Navigation_TabChanged", function (oEvent) {
                const sTabKey = oEvent.getParameter("tabKey");
                this.getView().getModel("viewState").setProperty("/currentTab", sTabKey)
            }.bind(this))
        }
    })
})