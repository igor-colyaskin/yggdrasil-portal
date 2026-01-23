sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.NavCard.NavCard", {

        onTabSelect: function (oEvent) {
            const oItem = oEvent.getParameter("item")
            const sKey = oItem.getKey()
            const sText = oItem.getText()

            // 1. Приветствие (твое требование)
            MessageToast.show("Переход в раздел: " + sText)

            // 2. Обновляем Контекст Хоста через SDK
            const oHost = this.getCardHost()
            if (oHost && oHost.setContext) {
                oHost.setContext({
                    "currentTab": sKey
                })

                // 3. На всякий случай кидаем событие в Резонантор
                this.publish("Navigation_TabChanged", {
                    tabKey: sKey
                })
            }
        }
    })
})