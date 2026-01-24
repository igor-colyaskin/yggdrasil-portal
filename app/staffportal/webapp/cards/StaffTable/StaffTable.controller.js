sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.StaffTable.StaffTable", {

        onInit: function () { },

        /**
         * Событие клика по кнопке "Set as Filter"
         */
        onSetAsFilter: function (oEvent) {
            // 1. Получаем контекст строки (OData v4)
            const oCtx = oEvent.getSource().getBindingContext()
            if (!oCtx) return

            const sID = oCtx.getProperty("ID")
            const sName = oCtx.getProperty("name")

            // 2. Обновляем состояние через SDK (BaseController)
            // Это обновит модель "ui", вызовет Host.setContext и сохранит ID в Storage
            this.setUIProperty("selectedEmployeeID", sID)

            // 3. Уведомляем систему через Эфирный Резонантор
            this.publish("Employee_Selected", {
                id: sID,
                name: sName
            })

            MessageToast.show(`Сотрудник ${sName} выбран как фильтр`)
        }
    })
})