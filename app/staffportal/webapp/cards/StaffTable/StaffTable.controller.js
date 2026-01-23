sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller", 
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.StaffTable.StaffTable", {
        
        onInit: function () {
            // Теперь просто шлем сигнал, BaseController сам найдет Хост
            this.publish("StaffPortal_Ready", { status: "Magic is happening" });
        },
    });
});