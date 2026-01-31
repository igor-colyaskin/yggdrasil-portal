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
        _launchNebula: function (sRole) {
            this.getView().getModel("ui").setProperty("/currentRole", sRole)

            // 1. Получаем "карту" для роли
            const oConfig = this._mRoleConfigs[sRole] || this._mRoleConfigs["Basic"]

            // 2. Строим навигацию (пока просто логи в консоль, скоро добавим NavCard)
            console.log(`🌌 Nebula Engine: Роль [${sRole}] принята. Карта загружена.`)

            // 3. Открываем Home по умолчанию
            this._assemblePage("home")
        },

        // --- PAGE ASSEMBLER (Сборочный цех) ---
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
            const oCard = new Card({
                manifest: "./cards/simple/manifest.json",
                parameters: {
                    "title": oParams.title,
                    "description": oParams.description
                }
            })

            // Добавляем карточку в ядро галактики
            this.byId("galaxyCore").addItem(oCard)
        }
    })
})