sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/integration/Host"
], function (UIComponent, Host) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // 1. Создаем физический объект Хоста
            this._oHost = new Host("epicHost")
            // 1. Создаем локальное хранилище состояния (наш Контекст)
            this._mContext = {
                "currentTab": "staff",
                "userRole": "Wizard"
            }

            // 2. Метод установки контекста (мы будем вызывать его из NavCard)
            this._oHost.setContext = function (mNewContext) {
                Object.assign(this._mContext, mNewContext)

                // ВАЖНО: Уведомляем все карточки, что контекст изменился
                // Это заставит их пересчитать биндинги вроде {context>/currentTab}
                this._oHost.fireConfigurationChange()
            }.bind(this)

            // 3. ОБЯЗАТЕЛЬНЫЙ МЕТОД: именно его ищет карточка, 
            // когда видит префикс 'context>' в своем манифесте
            this._oHost.getContext = function () {
                return Promise.resolve(this._mContext)
            }.bind(this)



            // 2. Создаем "сердце" Резонантора — шину событий
            // Мы используем EventProvider, так как это легкий стандартный способ UI5
            this._oResonator = new sap.ui.base.EventProvider()

            // 3. Внедряем метод ПУБЛИКАЦИИ (сигнал от карточки -> в эфир)
            this._oHost.publishEvent = function (sEventName, oData) {
                // 'this' здесь будет указывать на объект Хоста
                // Но нам нужно вызвать fireEvent у нашего Резонантора
                // Поэтому используем ссылку на компонент или создаем замыкание
                this.getEventProvider().fireEvent(sEventName, oData)

                console.log("📡 [Эфирный Резонантор]: Событие '" + sEventName + "' отправлено", oData)
            }.bind(this) // bind(this) привязывает контекст к Компоненту, чтобы видеть _oResonator

            // 4. Внедряем метод ПОДПИСКИ (слушаем эфир)
            this._oHost.subscribeEvent = function (sEventName, fnFunction, oListener) {
                this.getEventProvider().attachEvent(sEventName, fnFunction, oListener)
            }.bind(this)

            // Вспомогательный метод для доступа к шине внутри Хоста
            this.getEventProvider = function () {
                return this._oResonator
            }

            // 5. Теперь запускаем стандартную инициализацию UI5
            sap.ui.core.UIComponent.prototype.init.apply(this, arguments)
        },
        /**
         * Метод для получения Хоста из контроллеров
         */
        getHost: function () {
            return this._oHost
        }
    })
})