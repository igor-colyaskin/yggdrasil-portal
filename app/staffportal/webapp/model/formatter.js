sap.ui.define([], function () {
    "use strict"

    return {
        /**
         * Определяет видимость блока в зависимости от выбранной табы
         * @param {string} sCurrentTab Текущая таба из модели
         * @param {string} sTargetTab Таба, для которой предназначен блок
         */
        isTabVisible: function (sCurrentTab, sTargetTab) {
            return sCurrentTab === sTargetTab
        }
    }
})