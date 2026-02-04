sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/core/util/MockServer"], function (jQuery, MockServer) {
    "use strict"
    const dataFolderPath = "com/sap/partner/wz/company/grouping/table/test/data"

    let oMockServer
    let _aMockResponses
    let oMockServerInterface = {
        /**
         * Initializes the mock server.
         * You can configure the delay with the URL parameter "serverDelay".
         * The local mock data in this folder is returned instead of the real data for testing.
         * @public
         */
        init: function () {
            // create
            return new Promise((resolve, reject) => {
                try {
                    var oMockServer = new MockServer({
                        rootUri: "/"
                    })

                    // Configure the mock server
                    MockServer.config({
                        autoRespond: true,
                        autoRespondAfter: 100 // ms delay to simulate backend
                    })

                    oMockServer.setRequests([
                        {
                            method: "GET",
                            path: new RegExp("PartnerGroupAffiliateSet(.*)"),
                            response: function (oXhr, sUrlParams) {
                                this.handleResponse(oXhr, "PartnerGroupAffiliateSet")
                            }.bind(this)
                        },
                        {
                            method: "POST",
                            path: new RegExp("api/contacts/search/byPartnersAndGroups(.*)"),
                            response: function (oXhr, sUrlParams) {
                                this.handleResponse(oXhr, "PartnerNotificationContacts")
                            }.bind(this)
                        }
                    ])
                    // Start the mock server
                    oMockServer.attachAfter("GET", this.overrideRequestResponse)
                    oMockServer.start()
                } catch (error) {
                    reject(error)
                }
            })
        },

        /**
         * @public returns the mockserver of the app, should be used in integration tests
         * @returns {sap.ui.core.util.MockServer} the mockserver instance
         */
        getMockServer: function () {
            return oMockServer
        },

        /**
         * Sets the mock responses array.
         *
         * @param {Array} aMockResponses - An array of mock response objects to be used in subsequent request handling.
         */
        setMockResponses: function (aMockResponses) {
            _aMockResponses = aMockResponses
        },

        /**
         * Adds a single mock response to the mock response collection. If collection doesn't exist beforehand, it is initiated here.
         *
         * @param {Object} oMockResponse - A mock response object to be added to the current list of mock responses.
         */
        addMockResponse: function (oMockResponse) {
            if (!_aMockResponses) this.setMockResponses([oMockResponse])
            else _aMockResponses.push(oMockResponse)
        },

        /**
         * Resets the collection of mock responses, clearing out custom responses.
         */
        resetMockResponses: function () {
            _aMockResponses = undefined
        },

        /**
         * Prepares and sends a mock response based on the specified JSON file or predefined mock responses.
         * If no response is specified, sends response with code 200 and data from JSON file.
         *
         * @param {object} oXhr - The XMLHttpRequest object that is used in mocking server responses.
         * @param {string} sResponseFileName - The name of the JSON file (without extension) to fetch data from if no overriding response is set.
         */
        handleResponse: function (oXhr, sResponseFileName) {
            let data, oOverridingResponse

            // If no response should be overridden, return data from JSON file as 200 response
            if (!_aMockResponses) {
                $.ajax({
                    async: false,
                    url: jQuery.sap.getModulePath(dataFolderPath) + `/${sResponseFileName}.json`,
                    dataType: "json",
                    success: (result) => (data = result)
                })
                oXhr.respondJSON(200, {}, JSON.stringify(data))
            } else if (
                _aMockResponses.some((response) => {
                    if (!response.path.test(oXhr.url)) return false
                    oOverridingResponse = response
                    return true
                })
            ) {
                oXhr.respondJSON(
                    oOverridingResponse.code,
                    { "Content-Type": "application/json" },
                    JSON.stringify(oOverridingResponse.payload)
                )
            }
        }
    }
    return oMockServerInterface
})
