sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.ProfileFeatureCard.ProfileFeatureCard", {
        onInit: function () {
            const oCard = this.getCard()
            // Получаем параметры, переданные через Shell -> Host -> Card
            const oParams = oCard.getCombinedParameters()
            const sKey = oParams.featureKey || "INFO"

            this._loadModule(sKey)
        },

        _loadModule: async function (sKey) {
            const oView = this.getView()
            const oContainer = this.byId("featureContainer")

            // Имитируем поиск по модели типов
            const aTypes = [
                { "key": "INFO", "fragment": "GeneralInfo" },
                { "key": "SALARY", "fragment": "SalaryDetails" },
                { "key": "EQUIPMENT", "fragment": "EquipmentList" }
            ]

            const oType = aTypes.find(t => t.key === sKey)
            if (!oType) return

            try {
                const oFragment = await oView.loadFragment({
                    name: "com.epic.yggdrasil.staffportal.cards.ProfileFeatureCard.fragments." + oType.fragment,
                    id: oView.createId(sKey) // Уникальный ID для элементов внутри фрагмента
                })
                oContainer.addItem(oFragment)
            } catch (oError) {
                console.error("🔴 [Magic Card]: Ошибка загрузки модуля " + sKey, oError)
            }
        }
    })
})