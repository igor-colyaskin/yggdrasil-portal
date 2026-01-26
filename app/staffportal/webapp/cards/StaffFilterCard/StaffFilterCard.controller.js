sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base/controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.StaffFilterCard.StaffFilterCard", {

        onInit: function () {
            // Если нужно что-то настроить при старте
        },

        /**
         * Магическая кнопка GO
         */
        onGo: function () {
            const sQuery = this.byId("nameFilter").getValue()
            const sDept = this.byId("deptFilter").getSelectedKey()

            // Формируем объект фильтров для публикации
            const oFilterData = {
                name: sQuery,
                dept: sDept
            }

            console.log("🌲 [StaffFilter]: Применяем фильтры", oFilterData)
            this.publish("Apply_Staff_Filter", oFilterData)
        },

        /**
         * Открытие настроек (будущий P13n)
         */
        onTableSettings: function () {
            // Пока просто уведомление, скоро добавим сюда P13nDialog
            sap.m.MessageToast.show("Настройки колонок будут доступны в следующем обновлении")
        }
    })
})