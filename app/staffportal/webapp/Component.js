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
            const oModel = new JSONModel()
            oModel.loadData(sap.ui.require.toUrl("com/epic/yggdrasil/staffportal/model/CardConfig.json"), null, false)

            // Подгружаем настройки колонок из Storage или ставим дефолт
            const oDefaultSettings = {
                staffTable: {
                    columns: {
                        name: true,
                        dept: true,
                        position: true,
                        email: true,
                        level: true
                    }
                },
                projectTable: {
                    columns: {
                        title: true,
                        status: true,
                        deadline: true
                    }
                }
            }

            const oSavedSettings = StorageUtils.readItem("tableSettings") || oDefaultSettings
            oModel.setProperty("/settings", oSavedSettings)

            const sSavedTab = StorageUtils.readItem("currentTab") || "staff"
            oModel.setProperty("/currentTab", sSavedTab)

            const sSavedID = StorageUtils.readItem("selectedID") || ""
            oModel.setProperty("/selectedEmployeeID", sSavedID)

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
                    Object.keys(mCtx).forEach(sKey => {
                        // 1. Обновляем живую модель в памяти
                        oUiModel.setProperty("/" + sKey, mCtx[sKey])

                        // 2. Автоматическое сохранение в LocalStorage
                        // Сохраняем всё: и selectedEmployeeID, и currentTab, и что угодно еще
                        const aPersistentKeys = ["selectedEmployeeID", "currentTab"]
                        if (aPersistentKeys.includes(sKey)) {
                            // Мапим ключ модели на ключ хранилища для красоты, если нужно
                            const sStorageKey = sKey === "selectedEmployeeID" ? "selectedID" : sKey
                            StorageUtils.setItem(sStorageKey, mCtx[sKey])
                        }
                    })

                    this._oHost.fireEvent("configurationChange")
                }
            }

            // this._oHost.setContext = (mCtx) => {
            //     if (mCtx) {
            //         // Обновляем модель (это автоматически обновит биндинги во всех карточках)
            //         Object.keys(mCtx).forEach(sKey => {
            //             // console.log(`📡 [Component]: Updating model key "${sKey}" with value:`, mCtx[sKey]) // <-- ПРОВЕРКА 2
            //             oUiModel.setProperty("/" + sKey, mCtx[sKey])
            //         })

            //         // Если изменился ID — сохраняем в Storage
            //         if (mCtx.selectedEmployeeID) {
            //             StorageUtils.setItem("selectedID", mCtx.selectedEmployeeID)
            //         }

            //         // Уведомляем карточки об изменении конфигурации
            //         this._oHost.fireEvent("configurationChange")
            //         // console.log("🌐 [Host Context]: Updated & Persisted", oUiModel.getData())
            //     }
            // }

            // --- 2. Эфирный Резонантор (PubSub) ---
            this._oHost.publishEvent = (sName, oData) => {
                this._oResonator.fireEvent(sName, oData)
                // console.log(`📡 [Resonator]: Published -> ${sName}`, oData)
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