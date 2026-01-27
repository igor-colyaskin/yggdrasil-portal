sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.ProjectRegistry.ProjectRegistry", {

        onInit: function () {
            // this.subscribe("Employee_Selected", this._onEmployeeChanged.bind(this))
        }
    })
})