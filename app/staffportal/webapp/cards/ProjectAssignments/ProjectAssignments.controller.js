sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.ProjectAssignments.ProjectAssignments", {

        onInit: function () {
            // this.subscribe("Employee_Selected", this._onEmployeeChanged.bind(this))
            // this.subscribe("Apply_Staff_Filter", this._applyFilterStaff.bind(this))
        },

        _applyFilterStaff: function (oData) {
            const oTable = this.byId("innerStaffTable") // ID твоей таблицы в XML
            const oBinding = oTable.getBinding("items")
            const aFilters = []
            const { name, dept } = oData.getParameters()

            // 1. Фильтр по имени или email (через OR)
            if (name) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, name),
                        new Filter("email", FilterOperator.Contains, name)
                    ],
                    and: false
                }))
            }

            // 2. Фильтр по департаменту
            if (dept && dept !== "All") { // Допустим, "All" - это сброс
                aFilters.push(new Filter("dept_ID", FilterOperator.EQ, dept))
            }

            // Применяем массив фильтров (через AND по умолчанию)
            oBinding.filter(aFilters)

            console.log(`🌲 [StaffTable]: Применено ${aFilters.length} фильтров`)
        },

        _onEmployeeChanged: function (oEvent) {
            const sID = oEvent.getParameter("id")
            const oView = this.getView()

            if (sID) {
                // Биндимся только если есть валидный UUID
                oView.bindElement({
                    path: "/Staff(" + sID + ")",
                    parameters: { $select: "ID,level,name" }
                })
            } else {
                // Если ID сброшен — просто отвязываем данные
                oView.unbindElement()
            }
        },

        onSetAsFilter: function (oEvent) {
            const sID = oEvent.getSource().getBindingContext().getProperty("ID")
            // Вызываем метод из родительского BaseController
            this.onToggleFilter(sID)
        }
    })
})