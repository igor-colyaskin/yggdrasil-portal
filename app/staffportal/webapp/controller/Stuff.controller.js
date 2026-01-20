sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/epic/yggdrasil/staffportal/helpers/CardManager"
], function (Controller, CardManager) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.controller.Stuff", {
        onInit: function () {
            const oCardManager = new CardManager(this)

            // В реальном проекте загружаем через модель, сейчас для теста — массив
            const aConfig = [
                { id: "head", fragment: "HeaderCard", target: "header" },
                { id: "nav", fragment: "NavigationTabs", target: "navigation" },
                { id: "table", fragment: "StaffTable", target: "content" }
            ]

            oCardManager.generate(aConfig)
        }
    })
})