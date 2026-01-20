sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Fragment"
], function (BaseObject, Fragment) {
    "use strict";

    return BaseObject.extend("com.epic.yggdrasil.staffportal.helpers.CardManager", {
        constructor: function (oController) {
            this._oController = oController;
            this._oView = oController.getView();
        },

        generate: function (aCards) {
            aCards.forEach(oCard => {
                const sZoneId = oCard.target + "Zone";
                const oContainer = this._oView.byId(sZoneId);

                Fragment.load({
                    id: this._oView.getId() + "--" + oCard.id,
                    name: "com.epic.yggdrasil.staffportal.view.fragments." + oCard.fragment,
                    controller: this._oController
                }).then(oFragment => {
                    oContainer.addContent(oFragment);
                });
            });
        }
    });
});