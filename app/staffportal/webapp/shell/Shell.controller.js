sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/epic/yggdrasil/staffportal/helpers/CardManager"
], function (Controller, CardManager) {
    "use strict"

    return Controller.extend("com.epic.yggdrasil.staffportal.shell.Shell", {
        onInit: function () {
            const oHost = this.getOwnerComponent().getHost()

            // Ищем карточку по ID
            const oHeaderCard = this.getView().byId("headerCard")

            if (oHeaderCard) {
                // Прикручиваем магию Хоста к карточке
                oHeaderCard.setHost(oHost)
                console.log("🔗 Связь установлена: HeaderCard <-> epicHost")
            }
        }
    })
})