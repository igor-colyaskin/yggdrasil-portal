sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.FinanceCard.FinanceCard", {

        onInit: function () {
            // Подписка на событие выбора сотрудника через наш "Эфирный Резонантор"
            this.subscribe("Employee_Selected", this._onEmployeeChanged)

            // Первичная загрузка, если ID уже был выбран до инициализации карточки
            const sInitialID = this.getUIProperty("/selectedEmployeeID")
            if (sInitialID) {
                this._refreshFinanceData(sInitialID)
            }
        },

        /**
         * Обработчик события смены сотрудника
         */
        _onEmployeeChanged: function (oEvent) {
            const sID = oEvent.getParameter("id")
            this._refreshFinanceData(sID)
        },

        /**
         * Загрузка финансовых данных через OData v2
         */
        _refreshFinanceData: function (sEmployeeID) {
            if (!sEmployeeID) {
                this.getView().unbindElement("fin")
                return
            }

            const oView = this.getView()
            const oModel = oView.getModel("fin")

            // Используем прямой read, так как v2 не поддерживает фильтры в bindElement напрямую.
            // Оборачиваем ID в одинарные кавычки для корректного парсинга GUID в CAP v2 Adapter.
            oModel.read("/Payrolls", {
                urlParameters: {
                    "$expand": "equipment",
                    "$filter": "employeeId eq '" + sEmployeeID + "'"
                },
                success: (oData) => {
                    if (oData?.results?.length > 0) {
                        const oEntry = oData.results[0]
                        // Формируем каноничный путь v2: /Entity(guid'...')
                        const sKey = oModel.createKey("/Payrolls", oEntry)

                        oView.bindElement({
                            path: "fin>" + (sKey.startsWith("/") ? sKey : "/" + sKey)
                        })
                    } else {
                        oView.unbindElement("fin")
                    }
                },
                error: (oError) => {
                    console.error("💰 [Finance]: Error loading payroll data", oError)
                    oView.unbindElement("fin")
                }
            })
        }
    })
})