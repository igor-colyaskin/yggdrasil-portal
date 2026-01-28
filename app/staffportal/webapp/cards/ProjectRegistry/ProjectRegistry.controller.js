sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.ProjectRegistry.ProjectRegistry", {

        onInit: function () {
            // Инициализируем пустую модель
            this.getView().setModel(new JSONModel({ items: [] }), "projects")

            // Загружаем данные
            this._fetchProjectData()
        },

        _fetchProjectData: async function () {
            const oView = this.getView()
            const oHost = this.getCardHost() // Наш epicHost

            // Получаем базовый URL через резолвер, как в реальности
            const sServiceUrl = oHost.resolveDestination("projectService")
            const sFullUrl = sServiceUrl + "/Projects"

            oView.setBusy(true)

            try {
                const response = await fetch(sFullUrl)
                if (!response.ok) throw new Error("Network response was not ok")

                const oData = await response.json()

                // В CAP OData v4 результат обычно в поле value
                const aProjects = oData.value || oData

                oView.getModel("projects").setProperty("/items", aProjects)
            } catch (oError) {
                console.error("🌲 [Registry]: Ошибка загрузки проектов", oError)
                // Тут можно вывести MessageToast
            } finally {
                oView.setBusy(false)
            }
        },

        formatStatus: function (sStatus) {
            const mStates = {
                "Active": "Success",
                "Pipeline": "Warning",
                "Archived": "None"
            }
            return mStates[sStatus] || "None"
        }
    })
})