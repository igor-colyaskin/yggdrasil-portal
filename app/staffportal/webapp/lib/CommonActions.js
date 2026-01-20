sap.ui.define(
    [
        "sap/ui/test/actions/Action",
        "sap/ui/test/Opa5",
        "sap/ui/test/matchers/AggregationLengthEquals",
        "sap/ui/test/matchers/Ancestor",
        "sap/ui/test/matchers/Properties",
        "sap/ui/test/matchers/BindingPath",
        "sap/ui/test/matchers/LabelFor",
        "sap/ui/test/matchers/I18NText",
        "sap/ui/test/actions/Press",
        "sap/ui/test/actions/EnterText",
        "sap/ui/test/actions/Drag",
        "sap/ui/test/actions/Drop",
        "sap/ui/test/actions/Scroll"
    ],
    function (
        Action,
        Opa5,
        AggregationLengthEquals,
        Ancestor,
        Properties,
        BindingPath,
        LabelFor,
        I18NText,
        Press,
        EnterText,
        Drag,
        Drop,
        Scroll
    ) {
        "use strict"

        // const CommonActions = Opa5.extend("my.namespace.CommonActionsLib", { //"integration.arrangements.Startup
        const CommonActions = {
            iChangePageForTable: function (bNext, sId) {
                return this.waitFor({
                    id: sId || /PartnerCarouselId/,
                    controlType: "sap.m.Carousel",
                    actions: function (oCarousel) {
                        oCarousel[bNext ? "next" : "previous"]()
                    },
                    success: function () {
                        Opa5.assert.ok(true, `Pressed the ${bNext ? "next" : "previous"} arrow on the carousel.`)
                    },
                    errorMessage: "Carousel not found."
                })
            },
            iUpdateCardContext: function (sContextName, sContextPath, oFiltersMap) {
                return this.waitFor({
                    id: "sampleCard",
                    controlType: "sap.ui.integration.widgets.Card",
                    success: (oCard) => {
                        oCard.triggerAction({
                            type: "Custom",
                            parameters: {
                                type: "updateContext",
                                namespace: sContextName,
                                context: { [sContextPath]: JSON.stringify(oFiltersMap) }
                            }
                        })
                    }
                })
            },
            //partner-table-filter
            iEnterTextInSearchField: function (sText) {
                // Simulate entering text into the search field
                return this.waitFor({
                    id: "filterbar-searchField",

                    actions: new EnterText({ text: sText }),
                    errorMessage: "Search field was not found"
                })
            },
            iPressButton: function (sId, sI18NKey) {
                const aMatchers = []
                sI18NKey &&
                    aMatchers.push(
                        new I18NText({
                            propertyName: "text",
                            key: sI18NKey
                        })
                    )
                return this.waitFor({
                    id: sId,
                    controlType: "sap.m.Button",
                    matchers: aMatchers,
                    actions: new Press(),
                    errorMessage: `Could not find the '${sId}' button`
                })
            },
            iReloadCard: function (sId) {
                return this.waitFor({
                    id: sId || "sampleCard",
                    controlType: "sap.ui.integration.widgets.Card",
                    success: (oCard) => {
                        oCard.refresh ? oCard.refresh() : oCard[0]?.refresh()
                    }
                })
            },
            iSelectItemsInMultiComboBox: function (sName, aKeysToSelect) {
                return this.waitFor({
                    controlType: "sap.m.MultiComboBox",
                    matchers: [new Properties({ name: sName })],
                    // success: function (oMultiComboBox) {
                    actions: function (oMultiComboBox) {
                        // Press the MultiComboBox to display the list
                        // new Press().executeOn(oMultiComboBox.getIcon());
                        // oMultiComboBox[0].getIcon().firePress();

                        // aKeysToSelect.forEach((sKey) => {
                        // 	this.waitFor({
                        // 		controlType: "sap.m.StandardListItem",
                        // 		matchers: [
                        // 			// new Ancestor(oMultiComboBox, false),
                        // 			// new Properties({ title: sKey })
                        // 			new Properties({ title: sKey })
                        // 		],
                        // 		actions: new Press(),
                        // 		errorMessage: "Cannot find item with key " + sKey
                        // 	});
                        // });
                        oMultiComboBox.setSelectedKeys(aKeysToSelect)
                    },
                    errorMessage: "Could not find the MultiComboBox with name: " + sName
                })
            },
            iSelectItemInSelect: function (sSelectId, vItemMatcher) {
                // vItemMatcher: a string (text) or object: { key: '...' } or { text: '...' }
                return this.waitFor({
                    id: sSelectId,
                    controlType: "sap.m.Select",
                    actions: new Press(),
                    success: function (aSelects) {
                        const oSelect = aSelects[0]
                        // Now dropdown is open; search for the item by key or text
                        this.waitFor({
                            controlType: "sap.ui.core.Item",
                            matchers: [
                                new Ancestor(oSelect),
                                function (oItem) {
                                    if (typeof vItemMatcher === "string") {
                                        return oItem.getText && oItem.getText() === vItemMatcher
                                    } else if (vItemMatcher && vItemMatcher.key !== undefined) {
                                        return oItem.getKey && oItem.getKey() === vItemMatcher.key
                                    } else if (vItemMatcher && vItemMatcher.text !== undefined) {
                                        return oItem.getText && oItem.getText() === vItemMatcher.text
                                    }
                                    return false
                                }
                            ],
                            actions: new Press(),
                            success: function (aItems) {
                                Opa5.assert.ok(
                                    aItems.length > 0,
                                    "Selected item in Select: " +
                                    (vItemMatcher.key || vItemMatcher.text || vItemMatcher)
                                )
                            },
                            errorMessage:
                                "Could not find select item matching: " +
                                (vItemMatcher.key || vItemMatcher.text || vItemMatcher)
                        })
                    }.bind(this),
                    errorMessage: "Select with id '" + sSelectId + "' not found"
                })
            },
            iSelectItemInTable: function (sTableId, sRowCustomDataId) {
                this.waitFor({
                    id: sTableId,
                    controlType: "sap.m.Table",
                    success: function (oTable) {
                        if (oTable instanceof Array) oTable = oTable[0]

                        return this.waitFor({
                            controlType: "sap.m.ColumnListItem",
                            matchers: [
                                Ancestor(oTable),
                                function (oColumnListItem) {
                                    const aCustomData = oColumnListItem.getCustomData()
                                    const oIdData = aCustomData.find(function (oCustomData) {
                                        return oCustomData.getKey() === "id"
                                    })
                                    return oIdData && oIdData.getValue() === sRowCustomDataId
                                }
                            ],
                            actions: new Press(),

                            errorMessage: "ColumnListItem not found"
                        })
                    },
                    errorMessage: "Table not found"
                })
            },

            iPressButtonItemInTable: function (sTableId, sRowCustomDataId, sI18NKey) {
                this.waitFor({
                    id: sTableId,
                    controlType: "sap.m.Table",
                    success: function (oTable) {
                        if (oTable instanceof Array) oTable = oTable[0]

                        return this.waitFor({
                            controlType: "sap.m.ColumnListItem",
                            matchers: [
                                Ancestor(oTable),
                                function (oColumnListItem) {
                                    const aCustomData = oColumnListItem.getCustomData()
                                    const oIdData = aCustomData.find(function (oCustomData) {
                                        return oCustomData.getKey() === "id"
                                    })
                                    return oIdData && oIdData.getValue() === sRowCustomDataId
                                }
                            ],
                            success: function (oColumnListItem) {
                                if (oColumnListItem instanceof Array) oColumnListItem = oColumnListItem[0]

                                return this.waitFor({
                                    controlType: "sap.m.Button",
                                    matchers: [
                                        Ancestor(oColumnListItem, false),
                                        new I18NText({
                                            propertyName: "text",
                                            key: sI18NKey
                                            //  useLibraryBundle: true  - still don't work
                                        })
                                    ],
                                    actions: new Press(),
                                    success: function (aItems) {
                                        Opa5.assert.ok(aItems.length > 0, "Btn is pressed")
                                    },
                                    errorMessage: `Could not find the '${sI18NKey}' i18n key button`
                                })
                            },
                            errorMessage: "ColumnListItem not found"
                        })
                    },
                    errorMessage: "Table not found"
                })
            },
            iChooseMenuItem: function (sI18NKey) {
                return this.waitFor({
                    controlType: "sap.m.MenuItem",
                    // matchers: new PropertyStrictEquals({ name: "text", value: sMenuItemText }),
                    matchers: new I18NText({
                        propertyName: "text",
                        key: sI18NKey
                    }),
                    actions: new Press(),
                    errorMessage: `Menu item with the '${sI18NKey}' i18n key not found or could not be pressed`
                })
            }
        }
        // });

        return CommonActions
    }
)