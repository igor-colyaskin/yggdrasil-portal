sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.cards.ContextStrip.Component", {
        metadata: { manifest: "json" },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments)

            // Находим наш Shell по жесткому ID из index.html
            const oShellComponent = sap.ui.core.Component.registry.filter(c => c.getId() === "shell")[0]

            if (oShellComponent) {
                // 1. Пробрасываем основную OData v4 модель (для данных сотрудника)
                this.setModel(oShellComponent.getModel())

                // 2. Пробрасываем UI модель (для currentTab и selectedEmployeeID)
                this.setModel(oShellComponent.getModel("ui"), "ui")

                console.log("🌲 [ContextStrip]: Модели OData и UI успешно подключены к Shell")
            } else {
                console.error("💥 [ContextStrip]: Не удалось найти Shell Component!")
            }
        }
    })
})