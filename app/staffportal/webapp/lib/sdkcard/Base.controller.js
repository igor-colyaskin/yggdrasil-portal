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

        // Быстрый доступ к Хосту - non working
        // getCardHost: function () {
        //     const oCard = this.getCard()
        //     return oCard ? oCard.getHostInstance() : null
        // },
        getCardHost: function () {
            const oComponent = this.getOwnerComponent()
            const oCompData = oComponent.getComponentData()

            // 1. Пытаемся достать объект карточки
            const oCard = oCompData && oCompData.__sapUiIntegration_card

            // if (oCard) {
                let vHost = oCard.getHostInstance()

                // Если вернулась строка (ID), превращаем её в объект
                // if (typeof vHost === "string") {
                //     vHost = sap.ui.getCore().byId(vHost) || sap.ui.getCore().getComponent(vHost)
                // }

                // Если всё еще не объект, пробуем через старый добрый метод сапа
                // if (!vHost || typeof vHost === "string") {
                    // Ищем среди всех элементов по ID
                    vHost = sap.ui.getCore().byId("epicHost")
                // }

                // if (vHost && typeof vHost === "object") {
                    return vHost
                // }
            // }

            // План "В": Прямое обращение к Хосту через главный компонент Шелла
            // Это самый надежный способ в нашей архитектуре
            // const oMainComponent = sap.ui.getCore().getComponent(oComponent.getManifestEntry("/sap.ui5/extends/component") || "")
            // if (oMainComponent && oMainComponent.getHost) {
            //     return oMainComponent.getHost()
            // }

            // return null
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