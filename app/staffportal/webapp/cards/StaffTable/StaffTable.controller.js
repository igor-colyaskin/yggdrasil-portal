sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller"
], function (BaseController) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.StaffTable.StaffTable", {

        onInit: function () {
            this.subscribe("Employee_Selected", this._onEmployeeChanged)
        },

        _onEmployeeChanged: function (oEvent) {
            const sID = oEvent.getParameter("id")
            const oView = this.getView()

            if (sID) {
                // Биндимся только если есть валидный UUID
                oView.bindElement({
                    path: "/Staff(" + sID + ")",
                    parameters: { $select: "ID,level,name" }
                })
            } else {
                // Если ID сброшен — просто отвязываем данные
                oView.unbindElement()
            }
        },

        onSetAsFilter: function (oEvent) {
            const sID = oEvent.getSource().getBindingContext().getProperty("ID")
            // Вызываем метод из родительского BaseController
            this.onToggleFilter(sID)
        }
    })
})