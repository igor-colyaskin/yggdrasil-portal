sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/integration/Host"
], function (UIComponent, Host) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.shell.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // 1. Создаем Хост с уникальным ID "epicHost"
            // Этот ID мы будем использовать в XML: host="epicHost"
            this._oHost = new Host("epicHost")

            // 2. Вызываем стандартный init (здесь создается View)
            UIComponent.prototype.init.apply(this, arguments)

            // 3. Инициализируем роутер
            this.getRouter().initialize()
        },

        /**
         * Метод для получения Хоста из контроллеров
         */
        getHost: function () {
            return this._oHost
        }
    })
})