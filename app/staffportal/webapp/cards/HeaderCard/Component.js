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

            // Проверяем данные прямо здесь
            const oComponentData = this.getComponentData()
            console.log("🛠 [Component.js Карточки] Данные:", oComponentData)

            if (oComponentData && oComponentData.card) {
                console.log("✅ Объект card успешно получен в Component.js")
            }
        }
    })
})