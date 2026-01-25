sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.NavCard.NavCard", {
        onInit: function () {
            // Подписываемся на глобальное событие сброса или смены состояния
            this.subscribe("Employee_Selected", this._onEmployeeChanged)
        },

        _onEmployeeChanged: function (oEvent) {
            const sID = oEvent.getParameter("id")

            // Если ID пустой (сброс), мы принудительно убеждаемся, что модель карточки
            // соответствует модели Шелла. 
            if (!sID) {
                // Если проброс моделей настроен верно, это сработает автоматически через биндинг.
                // Но для надежности можем явно "подтолкнуть" TabBar:
                this.setUIProperty("currentTab", "staff")
            }
        },
        /**
         * Обработка выбора вкладки
         */
        onTabSelect: function (oEvent) {
            const oItem = oEvent.getParameter("item")
            const sKey = oItem.getKey()
            const sText = oItem.getText()

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