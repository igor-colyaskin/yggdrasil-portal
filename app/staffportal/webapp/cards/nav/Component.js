sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict"

    return UIComponent.extend("com.epic.nebula.cards.nav.Component", {
        metadata: { manifest: "json" },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments)
            // 1. Получаем данные инициализации
            const oCompData = this.getComponentData()

            // 2. Важнейший момент: прописываем ссылку на карту для SDK
            // Твой BaseController ищет именно это свойство через getOwnerComponent()
            this.__sapUiIntegration_card = oCompData.__sapUiIntegration_card

            // 3. Стандартная инициализация

            // 4. Модель для табов
            this.setModel(new JSONModel(), "cardData")

            // 5. Запуск синхронизации
            this._syncWithHost()
        },

        _syncWithHost: function () {
            // Используем метод из твоего SDK (раз мы его пришили выше)
            const oCard = this.__sapUiIntegration_card
            const oHost = oCard ? oCard.getHostInstance() : null

            if (oHost) {
                oHost.getContext().then(function (oUiData) {
                    if (oUiData && oUiData.currentRoleConfig) {
                        const aItems = oUiData.currentRoleConfig.navigation || []
                        this.getModel("cardData").setData({ items: aItems })
                        console.log("🌌 NavCard: Ether connection established. Tabs loaded.")
                    }
                }.bind(this))
            } else {
                console.error("🚫 NavCard: Host instance not found via Card Bridge.")
            }
        }
    })
})