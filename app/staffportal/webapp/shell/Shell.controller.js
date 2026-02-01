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
            this.byId("galaxyCore").destroyItems()
            const oParams = sPageId === "home" ?
                { title: "Welcome", description: "Nebula Core Active" } :
                { title: "System: Staff", description: "Data synchronized" }
            this._forgeCard(oParams)
        },

        _forgeCard: function (oParams) {
            const oCard = new Card({
                manifest: sap.ui.require.toUrl("com/epic/nebula/cards/simple/manifest.json"),
                host: this.getOwnerComponent().getHost(),
                parameters: { "title": oParams.title, "description": oParams.description }
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