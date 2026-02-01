sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict"

    return UIComponent.extend("com.epic.nebula.cards.nav.Component", {
        metadata: { manifest: "json" },

        init: function () {
            // Прокидываем карту в компонент для SDK (BaseController)
            this.__sapUiIntegration_card = this.getComponentData().__sapUiIntegration_card

            UIComponent.prototype.init.apply(this, arguments)
            this.setModel(new JSONModel(), "cardData")
            this._syncWithHost()
        },

        _syncWithHost: function () {
            const oCard = this.__sapUiIntegration_card
            const oHost = oCard ? oCard.getHostInstance() : null

            if (!oHost) return

            // Используем bind(this), чтобы внутри функции мы видели модель компонента
            const fnRefresh = function () {
                oHost.getContext().then(function (oData) {
                    const aItems = oData?.currentRoleConfig?.navigation || []
                    this.getModel("cardData").setData({ items: aItems })
                    console.log("🌌 NavCard: Context refreshed via Ether.")
                }.bind(this))
            }.bind(this)

            // 1. Подписываемся на событие через стандартный attachEvent
            // "configurationChange" — это то самое событие, которое мы вызываем в Shell через fireEvent
            oHost.attachEvent("configurationChange", fnRefresh)

            // 2. Первый запуск
            fnRefresh()
        }
    })
})