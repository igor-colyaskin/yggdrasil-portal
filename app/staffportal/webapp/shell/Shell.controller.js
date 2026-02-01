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

            // Используем эндпоинт PortalService
            const sUrl = "/odata/v4/portal/RolePages('" + sRole + "')?$expand=pages"

            try {
                const oResponse = await fetch(sUrl)
                const oData = await oResponse.json()

                if (!oData || !oData.pages) throw new Error("No config found")

                const mPages = {}
                oData.pages.forEach(p => {
                    mPages[p.ID] = {
                        layout: p.layout,
                        cards: JSON.parse(p.config) // Десериализуем JSON из строки
                    }
                })

                this.getModel("ui").setProperty("/pagesConfig", mPages)

                // Формируем табы
                const aNavItems = Object.keys(mPages).map(sKey => ({
                    tab: sKey,
                    label: sKey.toUpperCase()
                }))

                this._forgeNavigation(aNavItems)
                this._assemblePage("home")

            } catch (oError) {
                console.error("🌌 Nebula Engine: Failed to sycn with BE", oError)
            }
        },
        _assemblePage: function (sPageId) {
            const oCore = this.byId("galaxyCore")
            oCore.destroyItems()

            // Берем настройки конкретной страницы из загруженного конфига
            const mPages = this.getModel("ui").getProperty("/pagesConfig")
            const oPageData = mPages[sPageId]

            if (!oPageData) return

            // Создаем контейнер (VBox или HBox)
            const oLayoutContainer = oPageData.layout === "horizontal"
                ? new sap.m.HBox({ wrap: "Wrap" })
                : new sap.m.VBox()

            // Куем карточки по списку из конфига
            oPageData.cards.forEach(oCardCfg => {
                const oCard = this._forgeCard(oCardCfg)
                oLayoutContainer.addItem(oCard)
            })

            oCore.addItem(oLayoutContainer)
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