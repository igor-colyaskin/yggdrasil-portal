sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.table.TableCard", {
        onInit: function () {
            const oCard = this.getCard() // Метод из твоего SDK
            const oParams = oCard.getCombinedParameters() // Получаем title и description из манифеста/шелла

            const oModel = new JSONModel({
                title: oParams.title || "Unknown",
                description: oParams.description || ""
            })
            this.getView().setModel(oModel, "cardData")
        }
    })
})