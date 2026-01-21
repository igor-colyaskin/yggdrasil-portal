sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller"// Твоя библиотека
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.HeaderCard.HeaderCard", {
        onInit: function () {
            // Вызываем Init базового контроллера, если там есть логика
            // BaseController.prototype.onInit.apply(this, arguments);
            
            console.log("🧙‍♂️ Контроллер карточки наследует SDK!");
            
            // Пример использования метода из твоего SDK:
            // const oBundle = this.getResourceBundle();
        },

        onAfterRendering: function() {
            // Здесь можно достучаться до параметров, переданных Хостом
            const oCard = this.getOwnerComponent().getComponentData().card;
            console.log("📦 Данные Хоста в карточке:", oCard);
        }
    });
});