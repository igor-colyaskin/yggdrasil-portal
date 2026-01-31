sap.ui.define([
    "com/epic/nebula/lib/sdkcard/Base.controller", // Наследуемся от твоего SDK
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/integration/widgets/Card"
], function (BaseController, JSONModel, Fragment, Card) {
    "use strict"

    return BaseController.extend("com.epic.nebula.shell.Shell", {

        // --- СИМУЛЯТОР БЭКЕНДА (Чертежи систем) ---
        _mRoleConfigs: {
            "Admin": {
                navigation: [
                    { tab: "home", label: "Home", pagePath: "home" },
                    { tab: "staff", label: "Staff", pagePath: "staff" },
                    { tab: "admin", label: "Admin Panel", pagePath: "admin" }
                ]
            },
            "Manager": {
                navigation: [
                    { tab: "home", label: "Home", pagePath: "home" },
                    { tab: "staff", label: "Staff", pagePath: "staff" }
                ]
            },
            "Basic": {
                navigation: [
                    { tab: "home", label: "Home", pagePath: "home" },
                    { tab: "staff", label: "Staff", pagePath: "staff" }
                ]
            }
        },
        onInit: function () {
            // Инициализируем UI модель
            const oUiModel = new JSONModel({
                currentRole: "",
                currentTab: "home"
            })
            this.getView().setModel(oUiModel, "ui")

            // Проверяем сохраненную роль
            const sSavedRole = localStorage.getItem("nebulaRole")
            if (sSavedRole) {
                this._launchNebula(sSavedRole)
            } else {
                this._openIdentityDialog()
            }
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

        // --- GENESIS LOGIC ---
        _launchNebula: async function (sRole) {
            const oUiModel = this.getView().getModel("ui")
            oUiModel.setProperty("/currentRole", sRole)

            // 1. ВКЛЮЧАЕМ ИНДИКАТОР
            this.byId("nebulaLoader").setVisible(true)

            // 2. STAGE 1 & 2 (Имитируем задержку и загрузку)
            const oConfig = this._mRoleConfigs[sRole]

            // Искусственно ждем 500мс для стабильности UX
            await new Promise(resolve => setTimeout(resolve, 500))

            // Выключаем индикатор
            this.byId("nebulaLoader").setVisible(false)

            // 3. СОЗДАЕМ НАВИГАЦИЮ
            this._forgeNavigation(oConfig.navigation)

            // 4. ОТКРЫВАЕМ HOME
            this._assemblePage("home")

            // 5. STAGE 3: Фоновая загрузка данных (Placeholder)
            this._preFetchSystemsData(oConfig.navigation)
        },

        /**
 * STAGE 3: Background Pre-fetching
 * Прогрев данных для всех доступных систем галактики
 */
        _preFetchSystemsData: async function (aNavigationItems) {
            console.log("🛰️ Nebula Engine: Starting Stage 3 (Background Fetch)...")

            // Фильтруем Home (он и так загружен) и запускаем загрузку для остальных систем
            const aSystemsToLoad = aNavigationItems.filter(item => item.tab !== "home")

            // Используем Promise.allSettled, чтобы если одна "система" упала, остальные догрузились
            await Promise.allSettled(aSystemsToLoad.map(async (oSystem) => {
                try {
                    console.log(`📡 Pre-fetching layout and data for system: ${oSystem.label}...`)

                    // Имитируем сетевую задержку для каждой системы
                    await new Promise(resolve => setTimeout(resolve, 800))

                    // Здесь в будущем будет вызов: 
                    // const oLayout = await this._getSystemLayout(oSystem.pagePath);
                    // this._cacheSystem(oSystem.tab, oLayout);

                    console.log(`✅ System [${oSystem.tab}] is cached and ready.`)
                } catch (oError) {
                    console.error(`❌ Failed to pre-fetch system [${oSystem.tab}]:`, oError)
                }
            }))

            console.log("🌌 All systems are synchronized. Total readiness achieved.")
        },

        _forgeNavigation: function (aItems) {
            const oNavContainer = this.byId("navContainer")
            oNavContainer.destroyItems()

            // Находим хост
            const oHost = sap.ui.getCore().byId("nebulaHost") ||
                (sap.ui.core.Element && sap.ui.core.Element.getElementById("nebulaHost"))

            if (!oHost) {
                console.error("💀 Nebula Fatal: nebulaHost not found!")
                return
            }

            // 1. ВАЖНО: Используем setContext вместо прямого setProperty.
            // Это обновит модель "ui" И вызовет fireEvent("configurationChange")
            oHost.setContext({
                currentRoleConfig: {
                    navigation: aItems
                }
            })

            // 2. Создаем карточку
            const oNavCard = new sap.ui.integration.widgets.Card({
                manifest: "./cards/nav/manifest.json",
                host: oHost
            })

            oNavContainer.addItem(oNavCard)

            // 3. Подписка
            oHost.subscribeEvent("nebulaTabChange", (oEvent) => {
                const sTab = oEvent.getParameter ? oEvent.getParameter("tab") : oEvent.mParameters.tab
                console.log("🌌 Shell: Received tab change signal:", sTab)
                this._assemblePage(sTab)
            })
        },
        _assemblePage: function (sPageId) {
            const oCore = this.byId("galaxyCore")
            oCore.destroyItems() // Очищаем старую систему

            // Имитируем разные страницы через SimpleCard
            if (sPageId === "home") {
                this._forgeCard({
                    title: "Добро пожаловать в Nebula",
                    description: `Вы вошли как ${this.getView().getModel("ui").getProperty("/currentRole")}. Начните исследование систем.`
                })
            } else if (sPageId === "staff") {
                this._forgeCard({ title: "Система: Персонал", description: "Список магических сущностей портала." })
            }
        },

        // --- THE FORGE (Метод отливки карточки) ---
        _forgeCard: function (oParams) {
            const sManifestUrl = sap.ui.require.toUrl("com/epic/nebula/cards/simple/manifest.json")

            const oCard = new Card({
                manifest: sManifestUrl,
                baseUrl: sManifestUrl.replace("manifest.json", ""),
                host: this.getOwnerComponent().getHost(),
                // Передаем параметры напрямую
                parameters: {
                    "title": oParams.title,
                    "description": oParams.description
                }
            })

            this.byId("galaxyCore").addItem(oCard)
        }
    })
})