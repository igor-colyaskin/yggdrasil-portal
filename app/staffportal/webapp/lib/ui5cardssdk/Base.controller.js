sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict"

    return Controller.extend("com.sap.fiorireuselibrary.ui5cardssdk.Base", {
        /**
         * Checks for "No Authorization" ONLY for PRM.
         * This function distinguishes if the response body is HTML or object with metadataString property.
         * @function
         * @param {object} oMetaData - The metadata object to check.
         * @returns {boolean} Returns true if metadata string exists, otherwise false.
         */
        fnAuthMetaDataPRMCheck: function (oMetaData) {
            // CHECK: for No Authorization ONLY for PRM
            // REASON: with no user oResponse.status === 200
            // DISTINGUISH: the response body is HTML with no user
            return !!oMetaData?.metadataString
        },
        /**
         * function get Resource Bundle
         * @returns {sap.base.i18n.ResourceBundle} ResourceBundle
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle()
        },
        /**
         * Convience method Gets the card object.
         * This method returns the UI5 card instance associated with this object.
         * @returns {object} The card object.
         */
        getCard() {
            return this.oCard
        },
        /**
         * Reads OData from a given path with optional filters and URL parameters.
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - The OData model to read from.
         * @param {string} sPath - The path of the entity set to read.
         * @param {sap.ui.model.Filter[]} [aFilters] - Filters to apply to the read operation.
         * @param {object} [oUrlParams] - Additional URL parameters for the read operation.
         * @returns {Promise<object>} A promise that resolves with the OData read results or rejects with an error.
         */
        fnODataRead: function (oModel, sPath, aFilters, oUrlParams) {
            // return this.getCard().resolveDestination("myDestination").then(() => {
            return new Promise((resolve, reject) => {
                oModel.read(sPath, {
                    filters: aFilters || [],
                    urlParameters: oUrlParams || {},
                    /**
                     * Success callback for the OData read operation.
                     * @param {object} oData - The data returned from the successful OData read operation.
                     */
                    success: (oData) => {
                        resolve(oData)
                    },
                    /**
                     * Error callback for the OData read operation.
                     * @param {object} oError - The error object returned from the failed OData read operation.
                     */
                    error: (oError) => {
                        reject(oError)
                    }
                })
            })
            // });
        },
        /**
         * Creates an OData entry.
         *
         * This function uses the SAP UI5 `oModel.create` method to create an entry in the OData service.
         * It returns a promise that resolves with the created data and the response, or rejects with an error.
         * @param {string} sURL - The service URL for the OData create operation.
         * @param {object} oData - The data object to be created in the OData service.
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - The OData model instance to be used for the create operation.
         * @returns {Promise<object>} - A promise that resolves with an object containing the created data and response,
         * or rejects with an error object.
         */
        fnODataCreate: function (sURL, oData, oModel) {
            return new Promise(function (resolve, reject) {
                const oParameters = {
                    filters: null,
                    async: true,
                    /**
                     * Success callback for the OData create operation.
                     * @param {object} oData - The data returned from the successful OData create operation.
                     * @param {object} oResponse - The full response object from the OData create operation.
                     */
                    success: function (oData, oResponse) {
                        resolve({
                            data: oData,
                            reponse: oResponse
                        })
                    },
                    /**
                     * Error callback for the OData create operation.
                     * @param {object} oError - The error object returned from the failed OData create operation.
                     */
                    error: function (oError) {
                        reject(oError)
                    }
                }
                oModel.create(sURL, oData, oParameters)
            })
        },
        /**
         * @param {string} sParamName - The name of the parameter to retrieve.
         * @returns {string|null} The value of the parameter, or null if not found.
         */
        getUrlParameter: function (sParamName) {
            const sUrl = window.location.href
            let oUrlParams = new URLSearchParams(sUrl.split("?")[1])
            return oUrlParams?.get(sParamName)
        }
    })
})