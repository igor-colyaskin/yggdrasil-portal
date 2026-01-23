sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/integration/Host",
    "sap/ui/base/EventProvider"
], function (UIComponent, Host, EventProvider) {
    "use strict"

    return UIComponent.extend("com.epic.yggdrasil.staffportal.Component", {
        metadata: { manifest: "json" },

        init: function () {
            this._setupHost()
            UIComponent.prototype.init.apply(this, arguments)
        },

        _setupHost: function () {
            this._oHost = new Host("epicHost")
            this._oResonator = new EventProvider()
            this._mContext = { "currentTab": "staff", "userRole": "Wizard" }

            // Внедряем методы управления контекстом
            this._oHost.getContext = () => Promise.resolve(this._mContext)
            this._oHost.setContext = (mCtx) => {
                Object.assign(this._mContext, mCtx)
                this._oHost.fireConfigurationChange()
            }

            // Внедряем методы Резонантора
            this._oHost.publishEvent = (sName, oData) => {
                this._oResonator.fireEvent(sName, oData)
                console.log(`📡 [Resonator]: ${sName}`, oData)
            }
            this._oHost.subscribeEvent = (sName, fn, oLis) => {
                this._oResonator.attachEvent(sName, fn, oLis)
            }

            // Добавляем резолвер для CAP сервисов
            this._oHost.resolveDestination = (sName) => {
                const mDests = {
                    "hrService": "/odata/v4/hr",
                    "financeService": "/finance",
                    "projectService": "/odata/v4/projects"
                }
                return mDests[sName] || null
            }
        },

        getHost: function () { return this._oHost }
    })
})