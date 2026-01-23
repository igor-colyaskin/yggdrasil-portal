sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller", 
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.HeaderCard.HeaderCard", {
        
        onInit: function () {
            // Теперь просто шлем сигнал, BaseController сам найдет Хост
            this.publish("StaffPortal_Ready", { status: "Magic is happening" });
        },

        onSendSignal: function () {
            this.publish("EtherPulse", {
                user: "Архитектор Саги",
                message: "Система стабильна"
            });
            MessageToast.show("Сигнал ушел в Эфир!");
        }
    });
});