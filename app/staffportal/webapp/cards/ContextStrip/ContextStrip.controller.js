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
                this._bindEmployee(sInitialID.selectedEmployeeID)
            }
        },

        _onEmployeeChanged: function (oEvent) {
            const sID = oEvent.getParameter("id")
            this._bindEmployee(sID)
        },

        _bindEmployee: function (sID) {
            const oView = this.getView()

            // 1. Если ID пустой (сброс фильтра)
            if (!sID || sID === "") {
                console.log("🌲 [ContextStrip]: Сброс контекста, отвязка данных")
                oView.unbindElement() // Снимаем привязку, чтобы очистить поля в UI
                return
            }

            // 2. Если ID валидный, выполняем биндинг
            oView.bindElement({
                path: "/Staff('" + sID + "')", // В v4 для UUID можно без лишних кавычек, если ID уже строка-UUID
                events: {
                    dataRequested: function () {
                        oView.setBusy(true)
                    },
                    dataReceived: function (oData) {
                        oView.setBusy(false)
                        if (oData.getParameter("error")) {
                            console.error("🌲 [ContextStrip]: Ошибка загрузки данных для ID", sID)
                        } else {
                            console.log("🌲 [ContextStrip]: Данные успешно привязаны")
                        }
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