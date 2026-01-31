sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.nav.NavCard", {
        onInit: function () {
            const oHost = this.getCardHost()
            console.log("🛰️ SDK Host Check:", oHost ? "Connected to Ether" : "Drifting in Void")
        },

        onTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key")

            // Используем твой SDK метод publish!
            this.publish("nebulaTabChange", {
                tab: sKey
            })

            console.log("🛰️ Navigation sent to Resonator:", sKey)
        }
    })
})