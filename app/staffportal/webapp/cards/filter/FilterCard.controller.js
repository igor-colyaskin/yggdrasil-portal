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

                // Сохраняем кнопку (она у нас последний элемент во FlexBox)
                const oGoButton = oContainer.getItems().find(i => i instanceof sap.m.Button)
                oContainer.removeAllItems()

                aFields.forEach(oField => {
                    // Создаем вертикальный контейнер для ОДНОГО поля
                    const oFieldBox = new sap.m.VBox({
                        items: [
                            new sap.m.Label({ text: oField.label, design: "Bold" }),
                            this._createInputByFieldType(oField)
                        ],
                        class: "sapUiSmallMarginEnd sapUiTinyMarginBottom"
                    }).addStyleClass("nebulaFilterItem")

                    oContainer.addItem(oFieldBox)
                })

                // Возвращаем кнопку Go в конец списка
                if (oGoButton) oContainer.addItem(oGoButton)
            })
        },

        _createInputByFieldType: function (oField) {
            let oControl
            const sBindingPath = "filters>/" + oField.id

            switch (oField.type) {
                case "Date":
                    oControl = new sap.m.DatePicker({ value: "{" + sBindingPath + "}" })
                    break
                default:
                    oControl = new sap.m.Input({
                        value: "{" + sBindingPath + "}",
                        placeholder: "Search...",
                        width: "200px" // Фиксированная ширина для аккуратности
                    })
            }
            return oControl
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