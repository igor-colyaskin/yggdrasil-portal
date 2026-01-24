sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.NavCard.NavCard", {

        /**
         * Обработка выбора вкладки
         */
        onTabSelect: function (oEvent) {
            const oItem = oEvent.getParameter("item")
            const sKey = oItem.getKey()
            const sText = oItem.getText()

            // 1. Приветствие
            MessageToast.show("Переход в раздел: " + sText)

            // 2. Обновляем состояние через SDK
            // Это автоматически обновит модель "ui" в Shell и прогонит данные через Host Context
            this.setUIProperty("currentTab", sKey)

            // 3. Уведомляем систему через Эфирный Резонантор
            // Теперь Shell.controller услышит это и сможет, например, скрыть/показать нужные контейнеры
            this.publish("Navigation_TabChanged", {
                tabKey: sKey
            })
        }
    })
})