sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "com/epic/yggdrasil/staffportal/lib/sdkcard/StorageUtils"
], function (BaseController, StorageUtils) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.StaffTable.StaffTable", {
        onInit: function () { },

        /**
         * Событие клика по кнопке "Set as Filter"
         */
        onSetAsFilter: function (oEvent) {
            // Получаем контекст строки таблицы
            const oCtx = oEvent.getSource().getBindingContext() // Это контекст OData v4
            const sID = oCtx.getProperty("ID") // Или как называется поле ID в твоем бэкенде
            const sName = oCtx.getProperty("name")

            // 1. Пишем в Storage через прокси
            StorageUtils.setItem("selectedID", sID)

            // 2. Обновляем глобальную модель (она безымянная, доступна через Shell)
            const oGlobalModel = this.getOwnerComponent().getModel()
            oGlobalModel.setProperty("/selectedEmployeeID", sID)

            // 3. Уведомляем систему через Резонантор
            this.publish("Employee_Selected", {
                id: sID,
                name: sName
            })

            sap.m.MessageToast.show("Сотрудник зафиксирован: " + sName)
        }
    })
})