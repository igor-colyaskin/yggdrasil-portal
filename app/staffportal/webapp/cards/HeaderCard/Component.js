sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.cards.HeaderCard.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // 1. Инициализация базы
            UIComponent.prototype.init.apply(this, arguments)

            // 2. В Integration Card мы часто получаем параметры из манифеста
            // Они будут доступны через this.getComponentData().card.getParameters()
            console.log("🛠️ HeaderCard Component инициализирован")
        }
    })
})