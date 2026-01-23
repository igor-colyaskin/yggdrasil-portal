sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/integration/Host",
    "sap/ui/base/EventProvider"
], function (UIComponent, Host, EventProvider) {
    "use strict";

    return UIComponent.extend("com.epic.yggdrasil.staffportal.Component", {
        metadata: { manifest: "json" },

        init: function () {
            // Сначала инициализируем базовый компонент
            UIComponent.prototype.init.apply(this, arguments);
            // Затем настраиваем Хост (инфраструктуру)
            this._setupHost();
        },

        /**
         * Настройка "epicHost" и "Эфирного Резонантора"
         */
        _setupHost: function () {
            this._oHost = new Host("epicHost");
            this._mContext = { "currentTab": "staff", "userRole": "Wizard" };

            // --- Shared Context Management ---
            this._oHost.getContext = () => Promise.resolve(this._mContext);
            
            this._oHost.setContext = (mCtx) => {
                if (mCtx) {
                    Object.assign(this._mContext, mCtx);
                    // Уведомляем карточки об изменении конфигурации
                    this._oHost.fireEvent("configurationChange");
                    console.log("🌐 [Host Context]: Updated", this._mContext);
                }
            };

            // --- Эфирный Резонантор (PubSub) ---
            this._oResonator = new EventProvider();

            this._oHost.publishEvent = (sName, oData) => {
                this._oResonator.fireEvent(sName, oData);
                console.log(`📡 [Resonator]: Published -> ${sName}`, oData);
            };

            this._oHost.subscribeEvent = (sName, fnCallback, oListener) => {
                this._oResonator.attachEvent(sName, fnCallback, oListener);
            };

            // --- Default Destination Resolver (Safety Net) ---
            this._oHost.resolveDestination = (sName) => {
                console.warn(`⚠️ [Host]: resolveDestination for '${sName}' called before Shell initialization.`);
                return ""; 
            };
        },

        /**
         * Публичный доступ к Хосту для контроллеров
         */
        getHost: function () { 
            return this._oHost; 
        }
    });
});