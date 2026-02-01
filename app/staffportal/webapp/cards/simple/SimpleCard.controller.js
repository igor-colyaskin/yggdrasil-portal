sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict"

    return BaseController.extend("com.epic.nebula.cards.simple.SimpleCard", {
        onInit: function () {
            this.setupCardModel()
            // Всё! title и description уже в модели и привязаны к View
        }
    })
})