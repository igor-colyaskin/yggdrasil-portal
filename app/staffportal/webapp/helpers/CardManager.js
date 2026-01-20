sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Fragment"
], function (BaseObject, Fragment) {
    "use strict"

    return BaseObject.extend("com.epic.yggdrasil.staffportal.helpers.CardManager", {
        constructor: function (oController) {
            this._oController = oController
            this._oView = oController.getView()
        },

        // generate: function (aCards) {
        //     aCards.forEach(oCard => {
        //         const sZoneId = oCard.target + "Zone";
        //         const oContainer = this._oView.byId(sZoneId);

        //         Fragment.load({
        //             id: this._oView.getId() + "--" + oCard.id,
        //             name: "com.epic.yggdrasil.staffportal.cards." + oCard.fragment,
        //             controller: this._oController
        //         }).then(oFragment => {
        //             oContainer.addContent(oFragment);
        //         });
        //     });
        // }
        generate: function (aCards) {
            const oView = this._oView // Сохраняем ссылку на вьюху
            const oController = this._oController

            aCards.forEach(oCard => {
                // Запускаем загрузку фрагмента
                Fragment.load({
                    id: oView.getId() + "--" + oCard.id,
                    name: "com.epic.yggdrasil.staffportal.cards." + oCard.fragment,
                    controller: oController
                }).then(function (oFragment) {
                    // Ищем контейнер ТОЛЬКО когда фрагмент уже готов
                    const sZoneId = oCard.target + "Zone"
                    const oContainer = oView.byId(sZoneId)

                    if (oContainer && typeof oContainer.addItem === "function") {
                        oContainer.addItem(oFragment)
                        console.log("✅ Голем [" + oCard.id + "] успешно приземлился в " + sZoneId)
                    } else {
                        console.error("❌ Не удалось найти VBox с ID: " + sZoneId + " или у него нет метода addContent")
                    }
                }).catch(function (oError) {
                    console.error("💀 Ошибка призыва Голема " + oCard.id + ":", oError)
                })
            })
        }
    })
})