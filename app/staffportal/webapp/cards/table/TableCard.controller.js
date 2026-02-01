sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.table.TableCard", {
        onInit: function () {
            // 1. Одной строчкой создаем модель с параметрами + пустой массив items
            this.setupCardModel({ items: [] })

            // 2. Читаем параметры уже из модели (или из oParams напрямую)
            const oData = this.getView().getModel("cardData").getData()

            if (oData.service && oData.entity) {
                this._fetchOData(oData.service, oData.entity)
            }
        },
        
        _fetchOData: async function (sServiceKey, sEntity) {
            const oHost = this.getCardHost()
            if (!oHost) return

            // 1. Получаем реальный URL через наш Resolver в Хосте
            const sBaseUrl = oHost.resolveDestination(sServiceKey)
            const sFullUrl = `${sBaseUrl}/${sEntity}`

            try {
                // 2. Делаем запрос (пока через fetch для простоты v4)
                const oResponse = await fetch(sFullUrl)
                const oData = await oResponse.json()

                // В OData v4 данные лежат в поле value
                this.getView().getModel("cardData").setProperty("/items", oData.value || [])
                console.log(`✅ TableCard: Loaded ${oData.value?.length} records from ${sEntity}`)
            } catch (oError) {
                console.error("💀 TableCard: Fetch failed", oError)
            }
        }
    })
})