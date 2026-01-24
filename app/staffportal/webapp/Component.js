sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/integration/Host",
    "sap/ui/base/EventProvider",
    "sap/ui/model/json/JSONModel",
    "com/epic/yggdrasil/staffportal/lib/sdkcard/StorageUtils"
], function (UIComponent, Host, EventProvider, JSONModel, StorageUtils) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.Component", {
        metadata: { manifest: "json" },

        init: function () {
            // 1. Инициализируем хранилище сразу
            StorageUtils.createStorage("YGG_PORTAL_2026")

            // 2. Инициализируем UI-модель (состояние)
            this._initUIModel()

            // 3. Базовая инициализация UIComponent
            UIComponent.prototype.init.apply(this, arguments)

            // 4. Настройка Хоста (инфраструктуры)
            this._setupHost()
        },

        /**
         * Инициализация глобальной модели состояния портала.
         * Данные из этой модели будут пробрасываться в карточки.
         */
        _initUIModel: function () {
            // 1. Создаем модель и сразу грузим данные из JSON
            const oModel = new JSONModel()
            oModel.loadData(sap.ui.require.toUrl("com/epic/yggdrasil/staffportal/model/CardConfig.json"), null, false)
            // false для синхронной загрузки, чтобы карточки были доступны сразу

            // 2. Дополняем модель данными из Storage (которые нельзя хранить в статичном JSON)
            oModel.setProperty("/selectedEmployeeID", StorageUtils.readItem("selectedID") || "")
            oModel.setProperty("/currentTab", StorageUtils.readItem("currentTab") || "staff")

            this.setModel(oModel, "ui")
        },
        /**
         * Настройка "epicHost", "Эфирного Резонантора" и Context Bridge
         */
        _setupHost: function () {
            this._oHost = new Host("epicHost")
            this._oResonator = new EventProvider()
            const oUiModel = this.getModel("ui")

            // --- 1. Shared Context Management (через UI модель) ---
            // Теперь контекст Хоста всегда возвращает актуальные данные из нашей модели "ui"
            this._oHost.getContext = () => {
                return Promise.resolve(oUiModel.getData())
            }

            this._oHost.setContext = (mCtx) => {
                if (mCtx) {
                    // Обновляем модель (это автоматически обновит биндинги во всех карточках)
                    Object.keys(mCtx).forEach(sKey => {
                        console.log(`📡 [Component]: Updating model key "${sKey}" with value:`, mCtx[sKey]) // <-- ПРОВЕРКА 2
                        oUiModel.setProperty("/" + sKey, mCtx[sKey])
                    })

                    // Если изменился ID — сохраняем в Storage
                    if (mCtx.selectedEmployeeID) {
                        StorageUtils.setItem("selectedID", mCtx.selectedEmployeeID)
                    }

                    // Уведомляем карточки об изменении конфигурации
                    this._oHost.fireEvent("configurationChange")
                    console.log("🌐 [Host Context]: Updated & Persisted", oUiModel.getData())
                }
            }

            // --- 2. Эфирный Резонантор (PubSub) ---
            this._oHost.publishEvent = (sName, oData) => {
                this._oResonator.fireEvent(sName, oData)
                console.log(`📡 [Resonator]: Published -> ${sName}`, oData)
            }

            this._oHost.subscribeEvent = (sName, fnCallback, oListener) => {
                this._oResonator.attachEvent(sName, fnCallback, oListener)
            }

            // --- 3. Destination Resolver ---
            // Централизованное управление адресами сервисов
            this._oHost.resolveDestination = (sName) => {
                const mDestinations = {
                    "hrService": "/odata/v4/hr",
                    "financeService": "/finance",
                    "projectService": "/odata/v4/projects"
                }
                return mDestinations[sName] || ""
            }
        },

        /**
         * Публичный доступ к Хосту для контроллеров и карточек
         */
        getHost: function () {
            return this._oHost
        }
    })
})