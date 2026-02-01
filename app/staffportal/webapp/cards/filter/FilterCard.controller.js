sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.filter.FilterCard", {
        onInit: function () {
            this.setupCardModel()
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