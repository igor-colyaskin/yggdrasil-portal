sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.simple.SimpleCard", {
        onInit: function () {
            const oView = this.getView()

            // 1. Создаем модель сразу
            const oModel = new JSONModel({
                title: "Loading...",
                description: "Synchronizing with Nebula..."
            })
            oView.setModel(oModel, "cardData")

            // 2. Вытаскиваем данные из "недр" контейнера
            const oComponent = this.getOwnerComponent()
            const oCard = oComponent.getCard ? oComponent.getCard() : null

            if (oCard) {
                oCard.attachManifestReady(function () {
                    const oParams = oCard.getCombinedParameters()

                    // Жесткая очистка: вытаскиваем только значения
                    const oData = {
                        title: oParams.title?.value || oParams.title || "",
                        description: oParams.description?.value || oParams.description || ""
                    }

                    oModel.setData(oData)
                    console.log("🛰️ Controller Force-Sync:", oData)
                })
            }
        }
    })
})