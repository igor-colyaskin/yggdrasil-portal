sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.StaffFilterCard.StaffFilterCard", {

        onInit: function () {
            const oSelect = this.byId("deptFilter")

            // Ручной биндинг с перехватом обновления
            oSelect.bindAggregation("items", {
                path: "/Departments",
                template: new sap.ui.core.Item({
                    key: "{ID}",
                    text: "{name}"
                }),
                events: {
                    // Этот обработчик вызывается КАЖДЫЙ РАЗ, когда данные приходят с сервера
                    dataReceived: function () {
                        // Добавляем "Все отделы", если его еще нет
                        const aItems = oSelect.getItems()
                        const bHasAll = aItems.some(item => item.getKey() === "ALL")

                        if (!bHasAll) {
                            oSelect.insertItem(new sap.ui.core.Item({
                                key: "ALL",
                                text: "Все отделы"
                            }), 0)
                            oSelect.setSelectedKey("ALL")
                        }
                    }
                }
            })
        },

        /**
         * Магическая кнопка GO
         */
        onGo: function () {
            const sDept = this.byId("deptFilter").getSelectedKey()
            const oFilters = {
                name: this.byId("nameFilter").getValue(),
                // Если выбрано "ALL" или ничего не выбрано - отправляем пустую строку или null
                dept: (sDept === "ALL" || !sDept) ? "" : sDept
            }

            this.publish("Apply_Staff_Filter", oFilters)
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