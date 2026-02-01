sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.nav.NavCard", {
        onInit: function () {
            // 1. Инициализируем стандартную модель cardData
            this.setupCardModel({ items: [] })

            // 2. Запускаем синхронизацию
            this._syncWithHost()
        },

        _syncWithHost: function () {
            const oHost = this.getCardHost()
            if (!oHost) return

            const fnRefresh = async () => {
                try {
                    const oContext = await oHost.getContext()
                    // Берем навигацию из контекста Хоста
                    const aItems = oContext?.currentRoleConfig?.navigation || []

                    this.getView().getModel("cardData").setProperty("/items", aItems)
                    console.log("🌌 NavCard: Navigation refreshed via Ether.")
                } catch (oError) {
                    console.error("🌌 NavCard: Sync failed", oError)
                }
            }

            // Подписываемся на изменения в Shell
            oHost.attachEvent("configurationChange", fnRefresh)

            // Первичная загрузка
            fnRefresh()
        },

        onTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key")
            // Публикация в Эфирный Резонантор через SDK
            this.publish("nebulaTabChange", { tab: sKey })
        }
    })
})