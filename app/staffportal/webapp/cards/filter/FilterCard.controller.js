sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.filter.FilterCard", {
        onInit: function () {
            this.setupCardModel()

            this.ensureMetadata().then(() => {
                this._buildFilterFields()
                const oData = this.getView().getModel("cardData").getData()
                console.log("🔍 FilterCard initialized with data:", oData)
            })
        },

        _buildFilterFields: function () {
            const oContainer = this.byId("filterFieldsContainer")
            const sEntity = this.getView().getModel("cardData").getProperty("/entity")

            this.getCardHost().getContext().then(oCtxData => {
                const aFields = oCtxData[`schema-${sEntity}`]
                if (!aFields) return

                oContainer.removeAllItems()

                aFields.forEach(oField => {
                    // Создаем Label для поля
                    oContainer.addItem(new sap.m.Label({ text: oField.label }))

                    // Решаем, какой инпут создать (наш "микрочип" в действии)
                    let oControl
                    switch (oField.type) {
                        case "Date":
                            oControl = new sap.m.DatePicker({ /* настройки */ })
                            break
                        case "Number":
                            oControl = new sap.m.StepInput({ /* настройки */ })
                            break
                        default:
                            oControl = new sap.m.Input({ placeholder: "Введите значение..." })
                    }

                    // Привязываем значение инпута к локальной модели фильтров
                    oControl.bindProperty("value", `filters>/${oField.id}`)
                    oContainer.addItem(oControl)
                })
            })
        },

        onFilter: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue")
            const oHost = this.getCardHost()
            const sTargetId = this.getView().getModel("cardData").getProperty("/targetId")

            if (oHost) {
                // Публикуем событие в Эфир
                oHost.publishEvent("nebulaFilterChange", {
                    query: sQuery,
                    targetId: sTargetId // Чтобы фильтровалась только нужная таблица
                })
                console.log(`📡 Filter: Signal sent [${sQuery}] for [${sTargetId}]`)
            }
        }
    })
})