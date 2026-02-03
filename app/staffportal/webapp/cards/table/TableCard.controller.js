sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ColumnListItem"
], function (BaseController, JSONModel, Column, Text, ColumnListItem) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.table.TableCard", {
        onInit: function () {
            this.setupCardModel({ items: [] })

            // Вместо async onInit, вызываем метод и обрабатываем результат
            this.ensureMetadata().then(() => {
                this._buildTableColumns()

                const oData = this.getView().getModel("cardData").getData()
                if (oData.service && oData.entity) {
                    this._fetchOData(oData.service, oData.entity)
                }
            })
        },

        _buildTableColumns: function () {
            const oTable = this.byId("nebulaDynamicTable")
            const sEntity = this.getView().getModel("cardData").getProperty("/entity")

            // ВАЖНО: Модель 'ui' принадлежит Shell.
            // Чтобы её прочитать из карточки, нам нужно обратиться к Host.
            const oHost = this.getCardHost()

            // Твоя реализация Host.getContext() возвращает Promise с данными модели ui
            oHost.getContext().then(oCtxData => {
                const aFields = oCtxData[`schema-${sEntity}`]

                if (!aFields) {
                    console.error(`🔴 [Nebula]: Схема для ${sEntity} не найдена в контексте.`)
                    return
                }

                oTable.removeAllColumns()
                const aCells = []

                aFields.forEach(oField => {
                    oTable.addColumn(new sap.m.Column({
                        header: new sap.m.Text({ text: oField.label })
                    }))

                    // Привязка ячейки к данным из items
                    aCells.push(new sap.m.Text({
                        text: "{cardData>" + oField.id + "}"
                    }))
                })

                oTable.bindItems({
                    path: "cardData>/items",
                    template: new sap.m.ColumnListItem({
                        cells: aCells
                    })
                })

                console.log(`📡 [Nebula]: Таблица ${sEntity} успешно собрана.`)
            })
        },

        _fetchOData: async function (sServiceKey, sEntity) {
            const oHost = this.getCardHost()
            if (!oHost) return

            // 1. Получаем базовый URL сервиса через Хост
            const sBaseUrl = oHost.resolveDestination(sServiceKey)
            const sFullUrl = `${sBaseUrl}/${sEntity}`

            try {
                console.log(`📡 [Nebula]: Запрос данных из ${sFullUrl}...`)

                const oResponse = await fetch(sFullUrl)
                if (!oResponse.ok) throw new Error(`Ошибка сети: ${oResponse.status}`)

                const oData = await oResponse.json()

                // 2. В OData v4 данные всегда в массиве "value"
                const aItems = oData.value || []

                // 3. Записываем данные в модель карточки
                this.getView().getModel("cardData").setProperty("/items", aItems)

                console.log(`✅ [Nebula]: Данные загружены (${aItems.length} записей)`)
            } catch (oError) {
                console.error("💀 [Nebula]: Ошибка при загрузке данных:", oError)
            }
        }
    })
})