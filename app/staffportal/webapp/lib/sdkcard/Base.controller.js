sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.lib.sdkcard.Base", {

        /**
         * Быстрый доступ к инстансу интеграционной карточки
         * @returns {sap.ui.integration.widgets.Card}
         */
        getCard: function () {
            // В Component-карточках объект передается через componentData
            return this.getOwnerComponent().getComponentData().__sapUiIntegration_card
        },

        /**
         * Получение объекта Host (epicHost) через карточку
         * @returns {sap.ui.integration.Host|null}
         */
        getCardHost: function () {
            const oCard = this.getCard()
            return oCard ? oCard.getHostInstance() : null
        },

        /**
         * Прокси для публикации событий в "Эфирный Резонантор"
         * @param {string} sEventName Имя события
         * @param {object} oData Данные
         */
        publish: function (sEventName, oData) {
            const oHost = this.getCardHost()
            if (oHost && typeof oHost.publishEvent === "function") {
                oHost.publishEvent(sEventName, oData)
            } else {
                console.error(`🔴 [SDK]: Не удалось опубликовать событие ${sEventName}. Хост не найден.`)
            }
        },

        /**
         * Прокси для подписки на события Резонантора
         * @param {string} sEventName Имя события
         * @param {function} fnHandler Функция-обработчик
         */
        subscribe: function (sEventName, fnHandler) {
            const oHost = this.getCardHost()
            if (oHost && typeof oHost.subscribeEvent === "function") {
                // Передаем 'this' третьим аргументом, чтобы сохранить контекст контроллера в обработчике
                oHost.subscribeEvent(sEventName, fnHandler, this)
            } else {
                console.warn(`🟡 [SDK]: Подписка на ${sEventName} отложена. Хост пока недоступен.`)
            }
        }
    })
})