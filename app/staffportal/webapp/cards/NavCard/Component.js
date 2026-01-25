sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.cards.NavCard.Component", {
        metadata: { manifest: "json" },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments)

            const oShell = sap.ui.core.Component.registry.filter(c => c.getId() === "shell")[0]
            if (oShell) {
                // Наследуем ту самую живую модель UI из Шелла
                this.setModel(oShell.getModel("ui"), "ui")
            }
        }
    })
})