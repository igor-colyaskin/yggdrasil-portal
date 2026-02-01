sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.epic.nebula.cards.nav.NavCard", {
        onTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            // Публикация в Эфирный Резонантор через SDK
            this.publish("nebulaTabChange", { tab: sKey });
        }
    });
});