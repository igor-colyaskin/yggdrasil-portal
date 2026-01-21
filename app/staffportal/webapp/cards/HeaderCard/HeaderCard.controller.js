sap.ui.define([
    "com/epic/yggdrasil/staffportal/lib/sdkcard/Base.controller", "sap/m/MessageToast"// Твоя библиотека
], function (BaseController, MessageToast) {
    "use strict"

    return BaseController.extend("com.epic.yggdrasil.staffportal.cards.HeaderCard.HeaderCard", {
        onInit: function () {
            setTimeout(function () {
                const oCard = this.getOwnerComponent().getComponentData().__sapUiIntegration_card
                if (oCard && oCard.getHostInstance().publishEvent) {
                    console.log("🚀 Публикуем событие StaffPortal_Ready из HeaderCard")
                    oCard.getHostInstance().publishEvent("StaffPortal_Ready", {
                        source: "HeaderCard",
                        status: "Magic is happening"
                    })
                }
            }.bind(this), 500)
        },

        onAfterRendering: function () {
            const oComponentData = this.getOwnerComponent().getComponentData()

            // Достаем объект через системный ключ
            const oCard = oComponentData.__sapUiIntegration_card

            if (oCard) {
                console.log("✅ Карточка в руках! ID:", oCard.getId())

                // Получаем наш Хост (тот самый, где живет Эфирный Резонантор)
                const oHost = oCard.getHostInstance()
                console.log("🧙‍♂️ Хост доступен:", oHost.getId())
                console.log("🧙‍♂️ Весь объект Хоста:", oHost)
                console.log("🔍 Есть ли метод publishEvent?:", !!oHost.publishEvent)

                // Теперь проверим наш Резонантор
                if (oHost.publishEvent) {
                    console.log("📡 Эфирный Резонантор готов к трансляции!")
                }
            } else {
                console.error("❌ Объект __sapUiIntegration_card не найден")
            }
        },

        onSendSignal: function () {
            // 1. Достаем объект карточки из системных данных компонента
            const oCard = this.getOwnerComponent().getComponentData().__sapUiIntegration_card

            if (oCard) {
                // 2. Получаем наш модифицированный Хост
                const oHost = oCard.getHostInstance()

                // 3. Проверяем наличие нашего магического метода
                if (oHost && typeof oHost.publishEvent === "function") {

                    // ОТПРАВЛЯЕМ СИГНАЛ!
                    oHost.publishEvent("EtherPulse", {
                        user: "Архитектор Саги",
                        message: "Система стабильна, Резонантор активен!"
                    })

                    MessageToast.show("Сигнал ушел в Эфир! Проверь консоль.")
                } else {
                    console.error("❌ Хост найден, но метод publishEvent отсутствует. Проверь Component.js Шелла.")
                }
            } else {
                console.error("❌ Не удалось найти объект карточки (__sapUiIntegration_card)")
            }
        }
    })
})