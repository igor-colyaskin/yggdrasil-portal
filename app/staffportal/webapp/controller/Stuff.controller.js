sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], function (Controller, Fragment) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.controller.Stuff", {
        onInit: function () {
            // Загружаем вкладку Overview при старте
            this._renderTabContent("overview")
        },

        onTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key")
            this._renderTabContent(sKey)
        },

        _renderTabContent: function (sKey) {
            const oContainer = this.byId(sKey + "Container") // VBox внутри IconTabFilter
            if (oContainer && oContainer.getItems().length === 0) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.epic.yggdrasil.staffportal.view.fragments." + sKey,
                    controller: this
                }).then(function (oContent) {
                    oContainer.addItem(oContent)
                })
            }
        },

        onEmployeeSelect: function (oEvent) {
            const oItem = oEvent.getParameter("listItem")
            const oCtx = oItem.getBindingContext()
            sap.m.MessageToast.show("Выбран сотрудник: " + oCtx.getProperty("name"))

            // Здесь мы позже задействуем Эфирный Резонантор, 
            // чтобы Finance таба узнала, чей ID загружать
        }
    })
})