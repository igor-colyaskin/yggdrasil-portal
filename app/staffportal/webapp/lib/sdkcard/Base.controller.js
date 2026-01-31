sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict"

    return Controller.extend("com.epic.nebula.lib.sdkcard.Base.controller", {
        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName)
        },
        /**
         * Быстрый доступ к инстансу интеграционной карточки
         */
        getCard: function () {
            const oComponentData = this.getOwnerComponent().getComponentData()
            if (!oComponentData) {
                return null
            }
            // Проверяем оба варианта имени свойства
            return oComponentData.__sapUiIntegration_card || oComponentData.card || null
        },

        /**
         * Получение объекта Host (epicHost) через карточку
         */
        getCardHost: function () {
            const oCard = this.getCard()
            return oCard ? oCard.getHostInstance() : null
        },

        /**
         * Быстрый доступ к UI-состоянию (модель "ui")
         * @param {string} sPath Путь к свойству (например, "/selectedEmployeeID")
         */
        getUIProperty: function (sPath) {
            return this.getOwnerComponent().getModel("ui").getProperty(`/${sPath}`)
        },

        /**
         * Установка значения в UI-состояние через Host (для синхронизации со Storage)
         */
        setUIProperty: function (sKey, vValue) {
            const oHost = this.getCardHost()
            if (oHost && typeof oHost.setContext === "function") {
                const oUpdate = {}
                oUpdate[sKey] = vValue
                oHost.setContext(oUpdate)
            }
        },

        /**
         * Прокси для публикации событий в "Эфирный Резонантор"
         */
        publish: function (sEventName, oData) {
            const oHost = this.getCardHost()
            if (oHost && typeof oHost.publishEvent === "function") {
                oHost.publishEvent(sEventName, oData)
            } else {
                console.error(`🔴 [SDK]: Не удалось опубликовать событие ${sEventName}.`)
            }
        },

        /**
         * Прокси для подписки на события Резонантора
         */
        subscribe: function (sEventName, fnHandler) {
            const oHost = this.getCardHost()
            if (oHost && typeof oHost.subscribeEvent === "function") {
                // 'this' передается третьим аргументом для сохранения контекста контроллера
                oHost.subscribeEvent(sEventName, fnHandler, this)
            }
        },

        onToggleFilter: function (sID) {
            const sCurrentSelected = this.getUIProperty("selectedEmployeeID")

            if (sCurrentSelected === sID) {
                // Повторный клик — вызываем сброс
                this.onResetFilter()
            } else {
                // Новый выбор
                this.setUIProperty("selectedEmployeeID", sID)
                this.publish("Employee_Selected", { id: sID })
            }
        },

        onResetFilter: function () {
            this.setUIProperty("selectedEmployeeID", "")
            this.setUIProperty("currentTab", "staff")
            this.publish("Employee_Selected", { id: "" })
            console.log("🌲 [Yggdrasil SDK]: Глобальный сброс контекста")
        }
    })
})