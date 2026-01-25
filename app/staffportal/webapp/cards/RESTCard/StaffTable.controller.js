sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.StaffTable.StaffTable", {

        onInit: function () {
            // 1. Инициализируем именованную модель с начальным состоянием
            const oStaffModel = new JSONModel({
                items: [],
                isBusy: true
            })
            this.getView().setModel(oStaffModel, "staffModel")

            // 2. Загружаем данные персонала
            this._loadStaffData()
        },

        /**
         * Загрузка данных из HR сервиса через дестинейшн Хоста
         */
        _loadStaffData: async function () {
            const oModel = this.getModel("staffModel")

            try {
                const oHost = this.getCardHost()
                if (!oHost) {
                    throw new Error("Host not found")
                }

                const sUrl = oHost.resolveDestination("hrService") + "/Staff"

                const oResponse = await fetch(sUrl)
                if (!oResponse.ok) {
                    throw new Error(`HTTP error! status: ${oResponse.status}`)
                }

                const oData = await oResponse.json()

                // Обновляем модель данными и выключаем индикатор загрузки
                oModel.setProperty("/items", oData.value || [])
                oModel.setProperty("/isBusy", false)

                console.log("🌳 [Yggdrasil]: Staff data successfully synchronized")
            } catch (oErr) {
                oModel.setProperty("/isBusy", false)
                console.error("💥 [Portal Error]: Failed to sync staff data", oErr)
            }
        }
    })
})