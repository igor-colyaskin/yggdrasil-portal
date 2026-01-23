// webapp/lib/sdkcard/Base.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.lib.sdkcard.Base.controller", {

        // Быстрый доступ к объекту интеграционной карточки
        getCard: function () {
            return this.getOwnerComponent().getComponentData().__sapUiIntegration_card
        },

        // Быстрый доступ к Хосту
        getCardHost: function () {
            const oCard = this.getCard()
            return oCard ? oCard.getHostInstance() : null
        },

        // Прокси для публикации событий
        publish: function (sEventName, oData) {
            const oHost = this.getCardHost()
            if (oHost && oHost.publishEvent) {
                oHost.publishEvent(sEventName, oData)
            }
        },

        // Прокси для подписки
        subscribe: function (sEventName, fnHandler) {
            const oHost = this.getCardHost()
            if (oHost && oHost.subscribeEvent) {
                oHost.subscribeEvent(sEventName, fnHandler, this)
            }
        }
    })
})