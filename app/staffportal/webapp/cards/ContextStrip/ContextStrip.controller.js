sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.ContextStrip.ContextStrip", {
        onInit: function () {
            // 1. Подписываемся на изменения ID
            this.subscribe("Employee_Selected", this._onEmployeeChanged)

            // 2. Проверяем, может ID уже есть (при перезагрузке)
            const sInitialID = this.getUIProperty("/selectedEmployeeID")
            if (sInitialID) {
                this._bindEmployee(sInitialID)
            }
        },

        _onEmployeeChanged: function (oEvent) {
            const sID = oEvent.getParameter("id")
            this._bindEmployee(sID)
        },

        _bindEmployee: function (sID) {
            const oView = this.getView()
            // Выполняем Element Binding к основной OData v4 модели
            oView.bindElement({
                path: "/Staff('" + sID + "')",
                events: {
                    dataReceived: function (oData) {
                        console.log("🌲 [ContextStrip]: Данные получены для ID", sID)
                    }
                }
            })
        },

        // Внутри ContextStrip.controller.js
        onResetFilter: function () {
            // 1. Сбрасываем ID через наш SDK (это очистит и модель, и Storage)
            this.setUIProperty("selectedEmployeeID", "")

            // 2. Возвращаем пользователя на вкладку Staff (Overview)
            this.setUIProperty("currentTab", "staff")

            // 3. Публикуем событие сброса (если кому-то еще нужно обновиться)
            this.publish("Employee_Selected", { id: "" })
        }
    })
})