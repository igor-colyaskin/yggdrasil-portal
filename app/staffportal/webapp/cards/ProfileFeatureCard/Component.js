sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.cards.StaffTable.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments)
            // Ищем в реестре именно главный компонент
            const oShellComponent = sap.ui.core.Component.registry.filter(c => c.getId() === "shell")[0]
            // Пробрасываем модели от Shell к Карточке
            this.setModel(oShellComponent.getModel()) // Основная OData v4 (безымянная)
            this.setModel(oShellComponent.getModel("ui"), "ui") // UI Модель (табы, фильтры)
        }
    })
})