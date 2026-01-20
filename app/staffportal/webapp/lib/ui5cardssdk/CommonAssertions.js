sap.ui.define(
    [
        "sap/ui/test/Opa5",
        "sap/ui/test/matchers/I18NText",
        "sap/ui/test/matchers/Ancestor",
        "sap/ui/test/matchers/AggregationContainsPropertyEqual",
        "./StorageUtils"
    ],
    function (Opa5, I18NText, Ancestor, AggregationContainsPropertyEqual, StorageUtils) {
        "use strict"

        // const CustomAssertions = Opa5.extend("my.namespace.CustomAssertions", { //"integration.arrangements.Startup
        const CustomAssertions = {
            // partner-authorization-exemption-table
            theCardShouldExist: function () {
                return this.waitFor({
                    controlType: "sap.ui.integration.widgets.Card",
                    success: function (aCards) {
                        Opa5.assert.ok(aCards.length === 1, "The card exists.")
                    },
                    errorMessage: "The card does not exist."
                })
            },
            theCardShouldHaveTable: function () {
                return this.waitFor({
                    controlType: "sap.m.Table",
                    success: function (aTables) {
                        Opa5.assert.ok(aTables.length === 1, "The card has a table.")
                    },
                    errorMessage: "The card does not have a table."
                })
            },
            theTableShouldHaveEntries: function (iEntryCount) {
                return this.waitFor({
                    controlType: "sap.m.ColumnListItem",
                    success: function (aItems) {
                        Opa5.assert.ok(aItems.length === iEntryCount, "The table has the correct number of entries.")
                    },
                    errorMessage: "The table does not have the correct number of entries."
                })
            },
            thePopoverShouldBeOpen: function () {
                return this.waitFor({
                    controlType: "sap.m.Popover",
                    success: function (aPopovers) {
                        Opa5.assert.ok(aPopovers.length === 1, "The popover is open.")
                    },
                    errorMessage: "The popover is not open."
                })
            },

            theCardShouldBeBlocked: function (sBlockMessageText) {
                return this.waitFor({
                    controlType: "sap.ui.integration.widgets.Card",
                    success: function (oCard) {
                        const oMessage = oCard[0].getBlockingMessage()
                        Opa5.assert.ok(oMessage, "Card id blocked")
                        Opa5.assert.equal(
                            oMessage.title,
                            sBlockMessageText,
                            "The card is blocked with the correct message."
                        )
                    },
                    errorMessage: "The card is not blocked with correct message."
                })
            },
            //partner-contact-user-authorizations-card
            theCardShouldBeProperlyBlocked: function (iErrorCode, sBlockingTitleKey, sBlockingDescriptionKey) {
                let oBundle
                this.waitFor({
                    controlType: "sap.ui.integration.widgets.Card",
                    check: function (aCards) {
                        const oCard = aCards[0]

                        return oCard
                            .getModel("i18n")
                            .getResourceBundle()
                            .then(function (oResBundle) {
                                oBundle = oResBundle
                                // async store value of the context
                                return true
                            })
                    }
                })

                return this.waitFor({
                    controlType: "sap.ui.integration.widgets.Card",
                    success: (oCard) => {
                        const oMessage = oCard[0].getBlockingMessage()
                        Opa5.assert.ok(oMessage, "Card is blocked")
                        Opa5.assert.equal(
                            oMessage.title,
                            iErrorCode
                                ? `${iErrorCode} ${oBundle.getText(sBlockingTitleKey)}`
                                : oBundle.getText(sBlockingTitleKey),
                            "The card is blocked with the correct title."
                        )
                        Opa5.assert.equal(
                            oMessage.description,
                            oBundle.getText(sBlockingDescriptionKey),
                            "The card is blocked with the correct description."
                        )
                    },
                    errorMessage: `The card is not blocked with ${iErrorCode}, ${sBlockingTitleKey}, ${sBlockingDescriptionKey} .`
                })
            },

            iShouldSeeTheTableWithRecordIds: function (sTableId, aExpectedIDs) {
                this.waitFor({
                    id: sTableId,
                    controlType: "sap.m.Table",
                    success: function (oTable) {
                        if (oTable instanceof Array) oTable = oTable[0]

                        const aRows = oTable.getItems()
                        const aIDs = aRows.map(function (oRow) {
                            const aCustomData = oRow.getCustomData()
                            const oIdData = aCustomData.find(function (oCustomData) {
                                return oCustomData.getKey() === "id"
                            })
                            return oIdData && oIdData.getValue()
                        })

                        const bAllPresent = aExpectedIDs.every(function (sId) {
                            return aIDs.includes(sId)
                        })

                        Opa5.assert.ok(
                            bAllPresent,
                            "Table rows have all expected CustomData IDs: " + aExpectedIDs.join(", ")
                        )
                    },
                    errorMessage: "Table not found"
                })
            },
            iShouldSeeRowTable: function (sTableId, sRowCustomDataId, bSelected) {
                return this.waitFor({
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
                                    return (
                                        oIdData &&
                                        oIdData.getValue() === sRowCustomDataId &&
                                        oColumnListItem.getHighlight() === (bSelected ? "Information" : "None")
                                    )
                                }
                            ],
                            success: function () {
                                Opa5.assert.ok(
                                    true,
                                    `Expected row is selected in the table with customdata id ${sRowCustomDataId}`
                                )
                            },

                            errorMessage: `ColumnListItem with customdata id ${sRowCustomDataId} not found `
                        })
                    },
                    errorMessage: "Table not found"
                })
            },
            iShouldSeeButtonRowTable: function (sTableId, sRowCustomDataId, sI18NKey, bEnabled = true) {
                return this.waitFor({
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
                                    check: function () {
                                        const aControls = oColumnListItem.getCells()
                                        const oButton = aControls.find(function (oChild) {
                                            return (
                                                oChild.getMetadata().getName() === "sap.m.Button" &&
                                                oChild?.getBinding("text")?.getPath() === sI18NKey &&
                                                oChild.getEnabled() === bEnabled
                                            )
                                        })
                                        return oButton
                                    },
                                    success: function () {
                                        Opa5.assert.ok(
                                            true,
                                            `Expected ColumnListItem in the table with customdata id ${sRowCustomDataId} with Button with ${sI18NKey} sI18NKey and enabled=${bEnabled} is found`
                                        )
                                    },
                                    errorMessage: `Button with ${sI18NKey} sI18NKey and enabled=${bEnabled} not found `
                                })
                            },
                            errorMessage: `ColumnListItem with customdata id ${sRowCustomDataId} not found `
                        })
                    },
                    errorMessage: "Table not found"
                })
            },
            iShouldSeeTableRowData: function (sTableId, iRowNo, oExpectedData) {
                return this.waitFor({
                    id: sTableId,
                    success: function (oTable) {
                        if (oTable instanceof Array) oTable = oTable[0]
                        const aRows = oTable.getItems()
                        let bMatchFound = false

                        if (aRows && aRows.length) {
                            const aCells = aRows[iRowNo].getCells()
                            const oRowData = {
                                PartnerName: aCells[0].getText(),
                                PartnerId: aCells[1].getText(),
                                CrmId: aCells[2].getText(),
                                PartnerCountry: aCells[3].getText(),
                                PartnerStatus: aCells[4].getText()
                            }

                            bMatchFound =
                                oRowData.PartnerName === oExpectedData.PartnerName &&
                                oRowData.PartnerId === oExpectedData.PartnerId &&
                                oRowData.CrmId === oExpectedData.CrmId &&
                                oRowData.PartnerCountry === oExpectedData.PartnerCountry &&
                                oRowData.PartnerStatus === oExpectedData.PartnerStatus
                        }
                        Opa5.assert.ok(bMatchFound, "Expected row is found in the table with compliant data")
                    },
                    errorMessage: "Expected row data not found in the table"
                })
            },
            iShouldSeeCarousel: function (sId, iActivePage, iTotalPages) {
                return this.waitFor({
                    id: sId || /PartnerCarouselId/,
                    controlType: "sap.m.Carousel",
                    matchers: [
                        function (oCarousel) {
                            const pages = oCarousel.getPages()
                            // Check active page, if provided
                            if (typeof iActivePage === "number" && oCarousel.getActivePage()) {
                                const sActivePageId = oCarousel.getActivePage()

                                const activePageIndex = pages.findIndex((oPage) => sActivePageId === oPage.getId())
                                if (activePageIndex !== iActivePage) return false
                            }
                            // Check total pages, if provided
                            if (typeof iTotalPages === "number") {
                                if (pages.length !== iTotalPages) return false
                            }
                            return true
                        }
                    ],
                    success: function () {
                        let sAssertMsg = "Carousel found"
                        if (typeof iActivePage === "number") sAssertMsg += " with active page " + iActivePage
                        if (typeof iTotalPages === "number") sAssertMsg += " and total pages " + iTotalPages
                        Opa5.assert.ok(true, sAssertMsg + ".")
                    },
                    errorMessage: `Carousel not found with active page ${iActivePage} and total pages ${iTotalPages}`
                })
            },
            //partner-table-filter
            iShouldSeeButton: function (sId, sI18NKey) {
                return this.waitFor({
                    controlType: "sap.m.Button",
                    id: sId, // Using the id defined in the html

                    matchers: new I18NText({
                        propertyName: "text",
                        key: sI18NKey
                    }),
                    success: function () {
                        Opa5.assert.ok(
                            true,
                            `The button with '${sId}' id and i18n text equal to '${sI18NKey}' is visible.`
                        )
                    },
                    errorMessage: `The button with '${sId}' id and i18n text equal to '${sI18NKey}' is NOT visible.`
                })
            },
            iShouldSeeControl: function (sControlType, sId, sI18NKey) {
                return this.waitFor({
                    controlType: sControlType,
                    id: sId,
                    matchers:
                        sI18NKey &&
                        new I18NText({
                            propertyName: "text",
                            key: sI18NKey
                        }),
                    success: function () {
                        Opa5.assert.ok(
                            true,
                            `The ${sControlType} control with '${sId}' ID and i18n text equal to '${sI18NKey}' is visible.`
                        )
                    },
                    errorMessage: `The ${sControlType} control with '${sId}' ID and i18n text equal to '${sI18NKey}' is NOT visible.`
                })
            },
            iShouldSeeTheSearchField: function (sFilterGroupItemName, sI18NKey) {
                const aMatchers = []
                sI18NKey && aMatchers.push(new I18NText({ propertyName: "placeholder", key: sI18NKey }))

                return this.waitFor({
                    controlType: "sap.ui.comp.filterbar.FilterGroupItem",
                    matchers: new Properties({ name: sFilterGroupItemName }),
                    success: function (aFilterGroupItems) {
                        aMatchers.push(new sap.ui.test.matchers.Ancestor(aFilterGroupItems[0]))

                        return this.waitFor({
                            controlType: "sap.m.SearchField",
                            matchers: aMatchers,

                            success: function () {
                                Opa5.assert.ok(true, "Found the search field")
                            },
                            errorMessage: "Did not find the search field"
                        })
                    },
                    errorMessage: `Did not find the FilterGroupItem with name '${sFilterGroupItemName}' `
                })
            },
            iShouldSeeMultiComboBox: function (sMultiComboBoxName) {
                return this.waitFor({
                    controlType: "sap.m.MultiComboBox",

                    matchers: new Properties({ name: sMultiComboBoxName }),
                    success: function () {
                        Opa5.assert.ok(true, `Found the MultiComboBox with name ${sMultiComboBoxName}`)
                    },
                    errorMessage: "Could not find the MultiComboBox with name " + sMultiComboBoxName
                })
            },

            iShouldSeeSelectedKeysInMultiComboBox: function (sMultiComboBoxName, aExpectedKeys) {
                // Check selected keys in a MultiComboBox
                return this.waitFor({
                    controlType: "sap.m.MultiComboBox",

                    matchers: new Properties({ name: sMultiComboBoxName }),
                    success: function (aMultiComboBoxes) {
                        const aSelectedKeys = aMultiComboBoxes[0].getSelectedKeys()
                        Opa5.assert.deepEqual(aSelectedKeys, aExpectedKeys, "MultiComboBox has expected selected keys")
                    },
                    errorMessage: `Could not find the MultiComboBox with name '${sMultiComboBoxName}' or '${JSON.stringify(aExpectedKeys)}' expected keys do not match.`
                })
            },

            iShouldSeeNumberOfItemsInMultiComboBox: function (sMultiComboBoxName, iExpectedItemCount) {
                // Verify the number of items in the MultiComboBox
                return this.waitFor({
                    controlType: "sap.m.MultiComboBox",

                    matchers: new Properties({ name: sMultiComboBoxName }),
                    success: function (aMultiComboBoxes) {
                        const iItemCount = aMultiComboBoxes[0].getItems().length
                        Opa5.assert.strictEqual(
                            iItemCount,
                            iExpectedItemCount,
                            "MultiComboBox has the expected number of items: " + iExpectedItemCount
                        )
                    },
                    errorMessage: "Could not find the MultiComboBox with name " + sMultiComboBoxName
                })
            },

            iShouldSeeSpecificItemsInMultiComboBox: function (sMultiComboBoxName, aKeyTextPairs) {
                // Verify specific items (by text) in the MultiComboBox
                return this.waitFor({
                    controlType: "sap.m.MultiComboBox",

                    matchers: new Properties({ name: sMultiComboBoxName }),
                    success: function (aMultiComboBoxes) {
                        const aItems = aMultiComboBoxes[0].getItems()

                        aKeyTextPairs.forEach(function (oKeyTextPair) {
                            Opa5.assert.ok(
                                aItems.some(
                                    (oItem) =>
                                        oKeyTextPair.key === oItem.getKey() && oKeyTextPair.text === oItem.getText()
                                ),
                                "MultiComboBox contains the item with item with: " + JSON.stringify(oKeyTextPair)
                            )
                        })
                    },
                    errorMessage: "Could not find the MultiComboBox with name " + sMultiComboBoxName
                })
            },
            theCardShouldHaveContext: function (sContextName, oContextData) {
                let sStoreAsyncsContextValues

                this.waitFor({
                    controlType: "sap.ui.integration.widgets.Card",
                    check: function (aCards) {
                        const oCard = aCards[0]

                        return oCard
                            .getHostInstance()
                            .getContextValue(sContextName)
                            .then(function (sContextValues) {
                                sStoreAsyncsContextValues = sContextValues
                                // async store value of the context
                                return true
                            })
                    }
                })

                // Initiates a wait for the specified control to be available in the UI
                return this.waitFor({
                    controlType: "sap.ui.integration.widgets.Card",
                    success: function () {
                        // check the async stored context of the card with oContextData
                        // sap.base.util.deepEqual
                        if (oContextData === "" && sStoreAsyncsContextValues === "") {
                            Opa5.assert.ok("The card context data matches and is empty")
                            return
                        }
                        Opa5.assert.deepEqual(
                            JSON.parse(sStoreAsyncsContextValues),
                            oContextData,
                            "The card context data matches the expected data."
                        )
                    },
                    errorMessage: "The card context data does NOT match the expected data."
                })
            },
            iShouldSeeStoredDataInLocalStorage: function (sStorageKeyPrefix, sLocalStorageField, sData) {
                this.waitFor({
                    check: function () {
                        StorageUtils.createStorage(sStorageKeyPrefix)
                        const sStoredData = StorageUtils.readItem(sLocalStorageField)
                        return sStoredData === sData
                    },
                    success: function () {
                        Opa5.assert.ok(
                            `Stored Data in the localStorage in ${sStorageKeyPrefix}-${sLocalStorageField} is matched with expected data`
                        )
                    },
                    errorMessage: `Stored Data in the localStorage in ${sStorageKeyPrefix}-${sLocalStorageField}  does NOT match the expected data.`
                })
            },
            iShouldSeeTheMenu: function (sId, aI18nKeys) {
                return this.waitFor({
                    // searchOpenDialogs : true,
                    id: sId,
                    controlType: "sap.m.MenuWrapper",
                    // matchers: new AggregationContainsPropertyEqual({ aggregationName: "items", propertyName: "text", propertyValue: "What is this card about?" }),

                    success: function (oMenuWrapper) {
                        if (oMenuWrapper instanceof Array) oMenuWrapper = oMenuWrapper[0]

                        return this.waitFor({
                            controlType: "sap.m.MenuItem",
                            matchers: [
                                Ancestor(oMenuWrapper),
                                function (oControl) {
                                    const sI18NKey = oControl?.getBinding("text")?.getPath()
                                    const bMatchFound = aI18nKeys.find(function (sI18NRefKey) {
                                        return sI18NRefKey === sI18NKey
                                    })
                                    return bMatchFound
                                }
                            ],
                            success: function (aMenuItems) {
                                Opa5.assert.ok(
                                    aMenuItems.length === aI18nKeys.length,
                                    "Menu is displayed with expected items"
                                )
                            },
                            errorMessage: `MenutItems with ${aI18nKeys} keys not found `
                        })
                    },
                    errorMessage: `oMenuWrapper with ${sId} id not found `
                })
            },

            iShouldSeeTheDialog: function (sId, sI18NKey) {

                const vMatchers = sI18NKey ? new I18NText({
                    propertyName: "title",
                    key: sI18NKey
                }) : []

                return this.waitFor({
                    id: sId,
                    controlType: "sap.m.Dialog",
                    matchers: vMatchers,
                    success: function () {
                        Opa5.assert.ok(true, "About dialog is displayed")
                    },
                    errorMessage: "About dialog was not displayed"
                })
            }
        }

        // });

        return CustomAssertions
    }
)