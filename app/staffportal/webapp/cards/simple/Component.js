sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict"

    return UIComponent.extend("com.epic.nebula.cards.simple.Component", { // Не забудь сменить ID для NavCard
        metadata: { manifest: "json" },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments)
        }
    })
})