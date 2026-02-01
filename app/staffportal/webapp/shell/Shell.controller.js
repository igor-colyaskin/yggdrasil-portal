sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/integration/widgets/Card"
], function (BaseController, JSONModel, Fragment, Card) {
    "use strict"

    return BaseController.extend("com.epic.nebula.shell.Shell", {
        _mRoleConfigs: {
            "Basic": { navigation: [{ tab: "home", label: "Home" }, { tab: "staff", label: "Staff" }] },
            "Admin": { navigation: [{ tab: "home", label: "Home" }, { tab: "staff", label: "Staff" }, { tab: "admin", label: "Admin" }] },
            "Manager": { navigation: [{ tab: "home", label: "Home" }, { tab: "staff", label: "Staff" }] }
        },

        onInit: function () {
            const oUiModel = new JSONModel({ currentRole: "", currentTab: "home" })
            this.getView().setModel(oUiModel, "ui")

            const sSavedRole = localStorage.getItem("nebulaRole")
            sSavedRole ? this._launchNebula(sSavedRole) : this._openIdentityDialog()
        },

        _launchNebula: async function (sRole) {
            this.getModel("ui").setProperty("/currentRole", sRole)
            const oConfig = this._mRoleConfigs[sRole] || this._mRoleConfigs["Basic"]

            this._forgeNavigation(oConfig.navigation)
            this._assemblePage("home")
        },

        _forgeNavigation: function (aItems) {
            const oHost = this.getOwnerComponent().getHost()

            // Заряжаем контекст и уведомляем карточки
            oHost.setContext({ currentRoleConfig: { navigation: aItems } })

            const oNavCard = new Card({
                manifest: "./cards/nav/manifest.json",
                host: oHost
            })

            this.byId("navContainer").destroyItems().addItem(oNavCard)

            // Подписка на Резонантор
            oHost.subscribeEvent("nebulaTabChange", (oEvent) => {
                const sTab = oEvent.getParameter("tab")
                this._assemblePage(sTab)
            })
        },

        _assemblePage: function (sPageId) {
            const oCore = this.byId("galaxyCore")
            oCore.destroyItems()

            // Чертежи страниц: теперь с указанием типа контейнера
            const mPageBlueprints = {
                "home": {
                    layout: "vertical",
                    cards: [
                        { type: "simple", title: "Новости", description: "Системы стабильны." },
                        { type: "simple", title: "Статус", description: "Резонантор 100%." }
                    ]
                },
                "staff": {
                    layout: "horizontal", // Попробуем горизонтальный ряд
                    cards: [
                        { type: "table", title: "Таблица", description: "Заглушка реестра." },
                        { type: "simple", title: "Инфо", description: "Справка по кадрам." }
                    ]
                },
                "admin": {
                    layout: "vertical",
                    cards: [
                        { type: "simple", title: "Root Console", description: "Access granted." }
                    ]
                }
            }

            const oConfig = mPageBlueprints[sPageId] || mPageBlueprints["home"]

            // 1. Создаем контейнер в зависимости от чертежа
            let oLayoutContainer
            if (oConfig.layout === "horizontal") {
                oLayoutContainer = new sap.m.HBox({
                    wrap: "Wrap", // Чтобы на узких экранах карточки переносились
                    items: []
                }).addStyleClass("sapUiSmallMarginTop")
            } else {
                oLayoutContainer = new sap.m.VBox({
                    items: []
                })
            }

            // 2. Куем карточки и кладем их в наш новый контейнер
            oConfig.cards.forEach(oCardCfg => {
                const oCard = this._forgeCard(oCardCfg)

                // Добавляем отступы в зависимости от ориентации
                if (oConfig.layout === "horizontal") {
                    oCard.addStyleClass("sapUiMediumMarginEnd sapUiSmallMarginBottom")
                } else {
                    oCard.addStyleClass("sapUiMediumMarginBottom")
                }

                oLayoutContainer.addItem(oCard)
            })

            oCore.addItem(oLayoutContainer)
        },

        // Немного подправим _forgeCard, чтобы она ВОЗВРАЩАЛА карточку, а не сама её добавляла
        _forgeCard: function (oConfig) {
            const mManifests = {
                "simple": "com/epic/nebula/cards/simple/manifest.json",
                "table": "com/epic/nebula/cards/table/manifest.json"
            }

            const sPath = mManifests[oConfig.type] || mManifests["simple"]
            const sUrl = sap.ui.require.toUrl(sPath)

            return new sap.ui.integration.widgets.Card({
                manifest: sUrl,
                baseUrl: sUrl.replace("manifest.json", ""),
                host: this.getOwnerComponent().getHost(),
                width: oConfig.type === "table" ? "600px" : "300px", // Разная ширина для наглядности
                parameters: {
                    "title": oConfig.title,
                    "description": oConfig.description
                }
            })
        },
        // --- IDENTITY ORACLE ---
        _openIdentityDialog: function () {
            if (!this._pIdentityDialog) {
                this._pIdentityDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.epic.nebula.shell.fragments.IdentityDialog",
                    controller: this
                }).then(oDialog => {
                    this.getView().addDependent(oDialog)
                    return oDialog
                })
            }
            this._pIdentityDialog.then(oDialog => oDialog.open())
        },

        onIdentityConfirm: function (oEvent) {
            const oSelectedItem = oEvent.getParameter("listItem")
            const sRole = oSelectedItem.getTitle()

            // Сохраняем и запускаем
            localStorage.setItem("nebulaRole", sRole)

            // Закрываем диалог
            this.byId("identityDialog").close()

            this._launchNebula(sRole)
        },

        onResetIdentity: function () {
            localStorage.removeItem("nebulaRole")
            location.reload() // Полная перезагрузка для чистоты Генезиса
        },

    })
})