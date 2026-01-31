sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict"

    return UIComponent.extend("com.epic.nebula.cards.simple.Component", { // Не забудь сменить ID для NavCard
        metadata: { manifest: "json" },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments)

            const oModel = new JSONModel()
            this.setModel(oModel, "cardData")

            // Прямой перехват карточки из данных инициализации
            const oComponentData = this.getComponentData()
            const oCard = oComponentData && oComponentData.card

            if (oCard) {
                console.log("⚓ Nebula: Card anchored via ComponentData")
                oCard.attachManifestReady(function () {
                    this._setupParameters(oCard.getCombinedParameters())
                }.bind(this))

                // На случай, если манифест уже был готов
                if (oCard.getCombinedParameters()) {
                    this._setupParameters(oCard.getCombinedParameters())
                }
            } else {
                console.error("🚫 Nebula Fatal: Card instance not found in ComponentData")
            }
        }
    })
})