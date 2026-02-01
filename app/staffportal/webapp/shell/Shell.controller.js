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
            oCore.destroyItems() // Полная очистка перед сменой системы

            // Карта соответствия: Tab ID -> Путь к манифесту карточки
            const mCardRegistry = {
                "home": "com/epic/nebula/cards/simple/manifest.json",
                "staff": "com/epic/nebula/cards/simple/manifest.json", // Временно та же Simple
                "admin": "com/epic/nebula/cards/simple/manifest.json"  // Временно та же Simple
            }

            const sManifestPath = mCardRegistry[sPageId] || mCardRegistry["home"]
            const sManifestUrl = sap.ui.require.toUrl(sManifestPath)

            // Данные для инициализации (потом уйдут в OData)
            const mInitialData = {
                "home": { title: "Центральный узел", description: "Добро пожаловать в Иггдрасиль." },
                "staff": { title: "Сектор: Персонал", description: "База данных магических сущностей." },
                "admin": { title: "Терминал Администратора", description: "Критический уровень доступа." }
            }

            this._forgeCard({
                manifestUrl: sManifestUrl,
                data: mInitialData[sPageId] || mInitialData["home"]
            })
        },

        _forgeCard: function (oConfig) {
            const oCard = new sap.ui.integration.widgets.Card({
                manifest: oConfig.manifestUrl,
                baseUrl: oConfig.manifestUrl.replace("manifest.json", ""),
                host: this.getOwnerComponent().getHost(),
                parameters: {
                    "title": oConfig.data.title,
                    "description": oConfig.data.description
                }
            })

            this.byId("galaxyCore").addItem(oCard)
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