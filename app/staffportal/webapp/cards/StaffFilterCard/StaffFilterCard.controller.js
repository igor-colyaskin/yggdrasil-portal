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
            const oView = this.getView()

            if (!this._pSettingsDialog) {
                // Загружаем фрагмент асинхронно
                this._pSettingsDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.epic.yggdrasil.staffportal.cards.StaffFilterCard.fragments.SettingsDialog",
                    controller: this // Привязываем этот же контроллер для обработки .onConfirmSettings
                }).then(function (oDialog) {
                    oView.addDependent(oDialog) // Прокидываем модели во фрагмент
                    return oDialog
                })
            }

            this._pSettingsDialog.then(function (oDialog) {
                oDialog.open()
            })
        },

        onConfirmSettings: function (oEvent) {
            // Поскольку у нас Two-Way Binding в фрагменте (selected="{ui>...}"),
            // значения в модели УЖЕ обновились сами!
            // Нам остается только сохранить их в Storage
            this.setUIProperty("settings", this.getUIProperty("settings"))
            sap.m.MessageToast.show("Настройки применены")
        }
    })
})