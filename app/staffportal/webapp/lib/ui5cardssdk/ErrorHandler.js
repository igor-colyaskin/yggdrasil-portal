sap.ui.define(
    [
        "sap/ui/base/Object",
        "sap/ui/integration/library",
        "sap/m/library",
        "sap/base/Log",
        "sap/ui/base/BindingParser",
        "sap/m/IllustratedMessageType",
        "sap/m/MessageBox",
        "./AuthorizationDialog.controller"
    ],
    function (
        UI5Object,
        integrationLibrary,
        library,
        Log,
        BindingParser,
        IllustratedMessageType,
        MessageBox,
        AuthorizationDialog
    ) {
        "use strict"

        const { ButtonType } = library
        const { CardBlockingMessageType } = integrationLibrary

        /**
         * Formats a JSON object to a pretty-printed and escaped string.
         * @param {object} oJson - The JSON object to format.
         * @returns {string} The formatted and escaped JSON string.
         */
        function jsonFormat(oJson) {
            return BindingParser.complexParser.escape(JSON.stringify(oJson, null, 4))
        }

        /**
         * Formats a request object for logging purposes.
         * @param {object} oRequest - The request object to format.
         * @returns {string} The formatted request string.
         */
        function requestFormat(oRequest) {
            if (oRequest.options) {
                oRequest.options.body = oRequest.body && oRequest.body.toString()
                oRequest.options.headers = Object.fromEntries(oRequest.options.headers)
            }

            return jsonFormat(oRequest)
        }

        return UI5Object.extend("com.sap.fiorireuselibrary.ui5cardssdk.ErrorHandler", {
            /**
             * Handles application errors by automatically attaching to the model events and displaying errors when needed.
             * @class
             * @param {sap.ui.core.UIComponent} oComponent - Reference to the app's component.
             * @public
             */
            constructor: function (oComponent) {
                this._oComponent = oComponent
            },

            /**
             * Attaches error handling to model metadata and request failures.
             * @param {sap.ui.model.Model} oModel - The model to attach error handling to.
             */
            attachErrorHandlingForModel(oModel) {
                oModel.attachMetadataFailed(this.handleErrorEvent.bind(this))
                oModel.attachRequestFailed(this.handleErrorEvent.bind(this))
            },

            /**
             * Checks for "No Authorization" specifically for PRM.
             * This function distinguishes if the response body is HTML or object with metadataString property.
             * @param {object} oMetaData - The metadata object to check.
             * @returns {boolean} Returns true if metadataString exists, otherwise false.
             */
            checkPRMMetaData: function (oMetaData) {
                return !!oMetaData?.metadataString
            },

            /**
             * Handles the Request Data Error.
             * @param {sap.ui.base.Event} oEvent - Error event object.
             * @param showMessageBox
             */
            handleErrorEvent: function (oEvent, showMessageBox = false) {
                if (this.isMaintenanceModeActive()) {
                    return
                }
                Log.error(oEvent)
                let oEventParameters
                try {
                    if (!this.isODataEvent(oEvent) && this.isErrorArray(oEvent)) {
                        oEventParameters = this.transformObject(oEvent)
                    } else {
                        oEventParameters = oEvent.getParameters()
                    }
                    if (showMessageBox) this._displayMessageBox(oEventParameters)
                    else {
                        const blockCardParams = this._configureRequestErrorInfo(oEventParameters)
                        this._displayBlockingMessage(blockCardParams)
                    }
                } catch (error) {
                    this._logAndDisplayError(error, "An unexpected error occurred in handleErrorEvent")
                }
            },

            /**
             * Displays error MessageBox
             * 
             * @param {object} oEventParameters - Error information from the failed request.
             */
            _displayMessageBox: function (oEventParameters) {
                const oBundle = this._getResourceBundle()
                MessageBox.error(
                    oEventParameters.response.body?.body?.detail ??
                    oBundle.getText("UNEXPECTED_ERROR_POPUP_DESCRIPTION"),
                    {
                        title:
                            oEventParameters.response.body?.body?.title ??
                            oBundle.getText("UNEXPECTED_ERROR_POPUP_TITLE"),
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK
                    }
                )
            },

            /**
             * Checks if the given event is an OData event.
             * Determines if the object has the characteristic 'getParameters' method commonly found in OData events.
             * @param {object} oEvent - The event object to be checked.
             * @returns {boolean} True if the event is an OData event with a `getParameters` function, otherwise false.
             */
            isODataEvent: function (oEvent) {
                return typeof oEvent === "object" && oEvent !== null && typeof oEvent.getParameters === "function"
            },

            /**
             * Checks if the given event is an array representing error events.
             * Determines if the oEvent is an array which typically contains error objects.
             * @param {*} oEvent - The event to be checked, expected an array in case of errors.
             * @returns {boolean} True if the event is an array, indicating it is an error array, otherwise false.
             */
            isErrorArray: function (oEvent) {
                return Array.isArray(oEvent)
            },
            /**
             * Handles custom error events.
             * @param {sap.ui.base.Event} oEvent - Error event object.
             */
            handleCustomErrorEvent: function (oEvent) {
                if (this.isMaintenanceModeActive()) {
                    return
                }
                try {
                    const blockCardParams = this._configureCustomErrorInfo(oEvent.getParameters())
                    blockCardParams.name = oEvent.name
                    this._displayBlockingMessage(blockCardParams)
                } catch (error) {
                    this._logAndDisplayError(error, "An unexpected error occurred in handleCustomErrorEvent")
                }
            },

            /**
             * Checks if the card is in maintenance mode.
             * If maintenance mode is active, it displays a blocking message.
             * @private
             */
            checkMaintenanceMode: function () {
                if (this.isMaintenanceModeActive()) {
                    try {
                        const blockCardParams = this._configureMaintainceModeErrorInfo()
                        this._displayBlockingMessage(blockCardParams)
                    } catch (error) {
                        this._logAndDisplayError(error, "An unexpected error occurred in handleCustomErrorEvent")
                    }
                }
            },

            /**
             * Checks if the card is in maintenance mode.
             * If maintenance mode is active, it displays a blocking message.
             * @private
             * @returns {boolean} Returns true if maintenance mode is active, otherwise false.
             */
            isMaintenanceModeActive: function () {
                const oCard = this._getCardInstance()
                // Check for a specific parameter in the card and add a button if it exists and is true
                const oParameters = oCard.getCombinedParameters()
                return oParameters && oParameters.showmaintenancemode && oParameters.showmaintenancemode === true
            },

            /**
             * Configures the error information for a failed data request.
             * @private
             * @param {object} mErrorInfo - Error information from the failed request.
             * @returns {object} Configured error information.
             */
            _configureRequestErrorInfo: function (mErrorInfo) {
                const { response: oResponse, responseText: sResponseText, request } = mErrorInfo

                let sIllustrationType = IllustratedMessageType.ErrorScreen
                let sTitle = this._getResourceText("CARD_ERROR_CONFIGURATION_TITLE")
                let sDescription = this._getResourceText("CARD_ERROR_CONFIGURATION_DESCRIPTION")
                let sUrl = request?.requestUri || ""
                let sDetails = this._getResourceText("CARD_ERROR_REQUEST_DETAILS", [sUrl])

                if (oResponse) {
                    // observed in partner-table-table
                    // temp solution to handle metadata issue when it return html page with 200 status code 
                    if (oResponse.statusCode === 200) {
                        oResponse.statusCode = 403
                        oResponse.statusText = "Forbidden"
                    }

                    sTitle = `${oResponse.statusCode} ${oResponse.statusText}`
                    sDescription = this._getResourceText("CARD_ERROR_REQUEST_DESCRIPTION")

                    switch (oResponse.statusCode) {
                        case 404:
                            sIllustrationType = IllustratedMessageType.PageNotFound
                            if (!oResponse.statusText) {
                                sTitle = "404 " + this._getResourceText("CARD_ERROR_REQUEST_NOTFOUND_TITLE")
                            }
                            break
                        case 408:
                            sIllustrationType = IllustratedMessageType.ReloadScreen
                            sDetails = this._getResourceText("CARD_ERROR_REQUEST_TIMEOUT_DETAILS", [sUrl])
                            break
                        case 401:
                        case 403:
                        case 511:
                            sDescription = this._getResourceText("CARD_ERROR_REQUEST_ACCESS_DENIED_DESCRIPTION")
                            break
                        default:
                            break
                    }
                }

                sDetails = `${sTitle}\n${sDescription}\n${sDetails}\n\n`
                sDetails += `${this._getResourceText("CARD_LOG_MSG")}\n${oResponse ? oResponse.statusText : mErrorInfo.message}\n\n`

                request && (sDetails += `${this._getResourceText("CARD_REQUEST")}\n${requestFormat(request)}\n\n`)
                oResponse &&
                    (sDetails += `${this._getResourceText("CARD_RESPONSE_HEADERS")}\n${requestFormat(oResponse)}\n${jsonFormat(Object.fromEntries(oResponse.headers))}\n\n`)

                if (oResponse && sResponseText) {
                    sDetails += this._getResourceText("CARD_RESPONSE") + "\n"
                    const sMsg = this._extractErrorDetails(sResponseText)

                    if (sMsg) {
                        sDetails += sMsg + "\n"
                    }

                    if (this._isValidJSON(sResponseText)) {
                        sDetails += jsonFormat(JSON.parse(sResponseText))
                    } else {
                        sDetails += BindingParser.complexParser.escape(sResponseText)
                    }

                    sDetails += "\n\n"
                }

                sDetails += this._getResourceText("CARD_STACK_TRACE") + "\n" + new Error().stack

                Log.error(sDetails)

                return {
                    type: CardBlockingMessageType.Error,
                    illustrationType: sIllustrationType,
                    title: sTitle,
                    description: sDescription,
                    details: sDetails,
                    httpResponse: oResponse
                }
            },

            /**
             * Configures the error information for custom error events.
             * @private
             * @param {object} customErrorInstance - Custom error instance containing error details.
             * @returns {object} Configured error information.
             */
            _configureMaintainceModeErrorInfo: function () {
                const oResourceBundle = this._getResourceBundle()

                return {
                    type: CardBlockingMessageType.Error,
                    illustrationType: IllustratedMessageType.SimpleEmptyDoc,
                    title: oResourceBundle.getText("MAINTAINCE_MODE_TITLE"),
                    description: oResourceBundle.getText("MAINTAINCE_MODE_DESCRIPTION"),
                    details: ""
                }
            },

            /**
             * Configures the error information for custom error events.
             * @private
             * @param {object} customErrorInstance - Custom error instance containing error details.
             * @returns {object} Configured error information.
             */
            _configureCustomErrorInfo: function (customErrorInstance) {
                const oResourceBundle = this._getResourceBundle()
                const sDetails = `${customErrorInstance.title}\n${customErrorInstance.message}\n\n${oResourceBundle.getText("CARD_STACK_TRACE")}\n${new Error().stack}`
                Log.error(sDetails)

                return {
                    type: CardBlockingMessageType.Error,
                    illustrationType: customErrorInstance.illustratedMessageType,
                    title: customErrorInstance.title,
                    description: customErrorInstance.message,
                    details: sDetails
                }
            },

            /**
             * Displays the specified blocking message on the card.
             * @private
             * @param {object} oErrorInfo - The information about the error to display.
             */
            _displayBlockingMessage: function (oErrorInfo) {
                const oCard = this._getCardInstance()
                this._setCardMinRequiredHeight(oCard)

                oCard.showBlockingMessage({
                    type: oErrorInfo.type,
                    title: oErrorInfo.title,
                    description: oErrorInfo.description,
                    illustrationType: oErrorInfo.illustrationType,
                    details: oErrorInfo.details,
                    additionalContent: this._getAdditionalContent(
                        oErrorInfo.details,
                        oErrorInfo.httpResponse,
                        oErrorInfo.name
                    )
                })
            },
            /**
             * Sets the minimum required height for a card's DOM element.
             *
             * This function retrieves the card's DOM reference and the required minimum height
             * from the card's manifest. If both the DOM reference and the minimum required
             * height are available, it applies the minimum height to the card's style.
             * @private
             * @param {object} oCard - The card object containing methods and properties related to a card.
             */
            _setCardMinRequiredHeight: function (oCard) {
                const oDomRef = oCard.getCardContent().getDomRef()
                const sMinRequiredHeight = oCard._oCardManifest.get("sap.card").requiredHeight
                if (oDomRef && sMinRequiredHeight) oDomRef.style.minHeight = sMinRequiredHeight
            },

            /**
             * Returns the additional content for the blocking message.
             * @private
             * @param {string} sDetails - The error details to be used in the additional content.
             * @param {object} [oHttpResponse] - The HTTP response object to check for status code.
             * @param {object} [oErrorName] - The name of custom exception
             * @returns {Array} Array of additional content objects.
             */
            _getAdditionalContent: function (sDetails, oHttpResponse, oErrorName) {
                const oCard = this._getCardInstance()
                const oBundle = this._getResourceBundle()
                const additionalContent = []
                // Check for a specific parameter in the card and add a button if it exists and is true
                const oParameters = oCard.getCombinedParameters()

                if (
                    oParameters &&
                    oParameters.showRetryButton &&
                    oParameters.showRetryButton === true &&
                    oHttpResponse &&
                    (oHttpResponse.statusCode === 504 || oHttpResponse.statusCode === 500)
                ) {
                    additionalContent.push({
                        text: oBundle.getText("RETRY"),
                        buttonType: ButtonType.Default,
                        /**
                         * Handles the press event for the retry button.
                         * Hides the blocking message and refreshes the card.
                         */
                        press: () => {
                            oCard.hideBlockingMessage()
                            oCard.refresh()
                        }
                    })

                    additionalContent.push({
                        text: oBundle.getText("CREATE_TICKET"),
                        buttonType: ButtonType.Emphasized,
                        /**
                         * Handles the press event for the retry button.
                         * Hides the blocking message and refreshes the card.
                         */
                        press: () => {
                            this._naviagateToUnifiedTicket()
                        }
                    })
                }
                if (
                    oParameters &&
                    oParameters.showNavigateBackButton &&
                    oParameters.showNavigateBackButton === true &&
                    oErrorName === "NotFoundPartnerIDError"
                ) {
                    additionalContent.push({
                        text: oBundle.getText("NAVIGATE_TO_HOME"),
                        buttonType: ButtonType.Emphasized,
                        /**
                         * Handles the press event for the Go to the Overview button.
                         * Navigates back to the previous page.
                         * @returns
                         */
                        press: () => this._navigateBack()
                    })
                }

                if (oParameters && oParameters.showDownloadLogsButton && oParameters.showDownloadLogsButton === true) {
                    additionalContent.push({
                        text: oBundle.getText("DOWNLOAD_ERROR_LOGS"),
                        type: ButtonType.Reject,
                        /**
                         * Handles the press event for the download log button.
                         * Downloads error details as txt files
                         * @returns
                         */
                        press: () => this._exportErrorLog(sDetails)
                    })
                }
                // Add "Request Access" button if status code is 403
                if (oHttpResponse && oHttpResponse.statusCode === 403) {
                    additionalContent.push({
                        text: oBundle.getText("REQUEST_ACCESS"),
                        type: ButtonType.Reject,
                        /**
                         * Handles the press event for the request access button.
                         * Opens the authorization dialog and sets the visibility of the goToServiceButtonId.
                         */
                        press: () => {
                            const oAuthDialogController = new AuthorizationDialog(this._oComponent)
                            oAuthDialogController.openDialog(true)
                        }
                    })
                }

                return additionalContent
            },

            /**
             * Downloads error details as txt file
             * @param {string} details Error details
             */
            _exportErrorLog: async function (details) {
                const oCard = this._getCardInstance()

                const currentUserValue = await oCard.getHostInstance().getContextValue("sap.workzone/currentUser")
                details = `current user: ${jsonFormat(currentUserValue)}\n${details}`

                const oBlob = new Blob([details], { type: "text/plain" })
                const oLink = document.createElement("a")
                oLink.download = "Error_log.txt"
                oLink.href = URL.createObjectURL(oBlob)
                oLink.click()
            },

            /**
             * Extracts error details from a response text.
             * @private
             * @param {string} sResponseText - Response text containing error details.
             * @returns {string} Extracted error details.
             */
            _extractErrorDetails: function (sResponseText) {
                let sMsg = ""
                const bCardDataProviderError = Array.isArray(sResponseText)
                const bOdataModelError = typeof sResponseText === "object"

                if (bCardDataProviderError) {
                    sMsg = this._getDataProviderErrorDetails(sResponseText)
                } else if (bOdataModelError) {
                    sMsg = this._getGenericErrorDetails(sResponseText)
                }
                return sMsg
            },

            /**
             * Extracts error details specifically for data provider errors.
             * @private
             * @param {Array} aErrorDetails - Array containing error details.
             * @returns {string} Extracted error message.
             */
            _getDataProviderErrorDetails: function (aErrorDetails) {
                if (aErrorDetails.length > 2) {
                    const details = aErrorDetails[2]
                    if (this._isValidJSON(details)) {
                        const errorData = JSON.parse(details)
                        return errorData?.error?.message?.value || ""
                    }
                    return details
                }
                return ""
            },

            /**
             * Checks if a string is a valid JSON.
             * @private
             * @param {string} str - The string to check.
             * @returns {boolean} True if the string is a valid JSON, otherwise false.
             */
            _isValidJSON: function (str) {
                try {
                    JSON.parse(str)
                } catch (e) {
                    Log.error(e)
                    return false
                }
                return true
            },

            /**
             * Extracts generic error details from error objects.
             * @private
             * @param {object} oError - Error object containing error details.
             * @returns {string} Extracted error message.
             */
            _getGenericErrorDetails: function (oError) {
                const bXMLType = oError.responseText && /<?xml/.test(oError.responseText)
                const sMsg = this._getResourceText("UNHANLED_ERROR")
                let sErrorDetails = ""

                if (bXMLType) {
                    const oParser = new DOMParser()
                    const oXmlDoc = oParser.parseFromString(oError.responseText, "text/xml")
                    const oMessage = oXmlDoc.getElementsByTagName("message")
                    sErrorDetails = oMessage[0]?.innerHTML
                } else if (oError instanceof Error) {
                    sErrorDetails = oError.message
                } else if (oError.responseText) {
                    sErrorDetails = JSON.parse(oError.responseText)?.error?.message?.value || ""
                }

                return sErrorDetails || sMsg
            },

            /**
             * Gets the resource bundle from the component model.
             * @private
             * @returns {sap.base.i18n.ResourceBundle} Resource bundle instance.
             */
            _getResourceBundle: function () {
                return this._oComponent.getModel("i18n").getResourceBundle()
            },

            /**
             * Gets a localized text from the resource bundle.
             * @private
             * @param {string} sKey - The key of the text in the resource bundle.
             * @param {Array} [aParams] - Optional parameters for the text.
             * @returns {string} Localized text.
             */
            _getResourceText: function (sKey, aParams) {
                return this._getResourceBundle().getText(sKey, aParams)
            },

            /**
             * Gets the card instance associated with the component.
             * @private
             * @returns {object} Card instance.
             */
            _getCardInstance: function () {
                return this._oComponent.getCard()
            },

            /**
             * Logs the error and displays a blocking message.
             * @private
             * @param {Error} error - Error object.
             * @param {string} sMessage - Log message.
             */
            _logAndDisplayError: function (error, sMessage) {
                Log.error(error)
                const details = `${error.message}\n${this._getResourceText("CARD_STACK_TRACE")}\n${new Error().stack}`
                Log.error(`${sMessage}: ${details}`)

                const blockCardParams = {
                    type: CardBlockingMessageType.Error,
                    illustrationType: IllustratedMessageType.ErrorScreen,
                    title: this._getResourceText("UNEXPECTED_ERROR_TITLE"),
                    description: this._getResourceText("UNEXPECTED_ERROR_DESCRIPTION"),
                    details: details
                }
                this._displayBlockingMessage(blockCardParams)
            },

            /**
             * Navigates back to the previous page.
             * @private
             */
            _navigateBack: function () {
                const oCard = this._getCardInstance()
                const oParameters = oCard.getCombinedParameters()
                this._sBackURL = oParameters.buildWorkZoneUrl
                this._sTarget = oParameters.target
                oCard.triggerAction({
                    type: "Navigation",
                    parameters: {
                        url: this._sBackURL,
                        target: this._sTarget
                    }
                })
            },

            /**
             * Navigates back to the previous page.
             * @private
             */
            _naviagateToUnifiedTicket: function () {
                const oCard = this._getCardInstance()
                oCard.triggerAction({
                    type: "Navigation",
                    parameters: {
                        url: "https://sapit-home-prod-004.launchpad.cfapps.eu10.hana.ondemand.com/site#unifiedticketing-Display&/create/ZGCR/ZGCO_PRM_GEN",
                        target: "_blank"
                    }
                })
            },
            /**
             * Transforms an input array into a structured object containing HTTP request and response details.
             * This function is particularly useful for standardizing error or response formats.
             * @param {Array} inputArray - An array containing information about the HTTP event, expected in the order:
             *   [statusText, statusObject, responseBodyString, requestOptions].
             *   - {string} inputArray[0] - The initial status text from the HTTP response.
             *   - {object} inputArray[1] - An object possibly containing a 'status' property for the HTTP status code.
             *   - {string} inputArray[2] - JSON formatted string representing the response body.
             *   - {object} inputArray[3] - Object containing details about the HTTP request, including 'url' and 'options'.
             * @returns {object} A transformed object containing details of the HTTP request and response:
             *   - {string} message - The default message indicating the HTTP request failed.
             *   - {object} request - Information about the HTTP request made.
             *     - {string} requestUri - The URI of the request.
             *     - {string} method - The HTTP method used for the request.
             *     - {object} headers - The headers included in the request.
             *   - {object} response - The HTTP response received.
             *     - {string} requestUri - The URI of the request.
             *     - {number} statusCode - The HTTP status code extracted from the input.
             *     - {string} statusText - The status text after removal of the status code if present.
             *     - {object} body - The parsed response body from the JSON string.
             *     - {Array} headers - An empty array for potential future headers in response.
             *   - {number} statusCode - The HTTP status code.
             *   - {string} statusText - The processed status text.
             *   - {string} responseText - A specific field from the response body, defaults to an empty string if not present.
             */
            transformObject: function (inputArray) {
                let statusText = inputArray[0]
                let statusCode = (inputArray[1] && inputArray[1].status) || 0
                if (statusText.includes(statusCode)) {
                    statusText = statusText.replace(statusCode, "").trim()
                }

                let responseBody = {}
                if (inputArray[2]) {
                    if (this._isValidJSON(inputArray[2])) {
                        responseBody = JSON.parse(inputArray[2])
                    } else {
                        responseBody = inputArray[2]
                    }
                }
                const requestOptions = inputArray[3]

                const transformedObject = {
                    message: "HTTP request failed",
                    request: {
                        requestUri: requestOptions.url,
                        method: requestOptions.options.method,
                        headers: requestOptions.options.headers || []
                    },
                    response: {
                        requestUri: requestOptions.url,
                        statusCode: statusCode,
                        statusText: statusText,
                        body: responseBody,
                        headers: []
                    },
                    statusCode: statusCode,
                    statusText: statusText,
                    responseText: responseBody.code || ""
                }

                return transformedObject
            }
        })
    }
)