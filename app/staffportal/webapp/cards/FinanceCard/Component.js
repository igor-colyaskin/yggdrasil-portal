sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.cards.FinanceCard.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // 1. Инициализация базы
            UIComponent.prototype.init.apply(this, arguments)

            // В cards/FinanceCard/Component.js
            const oShell = sap.ui.core.Component.registry.filter(c => c.getId() === "shell")[0]
            if (oShell) {
                this.setModel(oShell.getModel("fin"), "fin")
                this.setModel(oShell.getModel("ui"), "ui")
            }
        }
    })
})