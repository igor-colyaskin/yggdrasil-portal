sap.ui.define([], function () {
    "use strict"
    return {
        "parameters": {
            "featureKey": {
                "manifestpath": "/sap.card/configuration/parameters/featureKey/value",
                "type": "string",
                "values": [
                    { "data": { "key": "INFO", "text": "General Information" } },
                    { "data": { "key": "SALARY", "text": "Salary Details" } },
                    { "data": { "key": "EQUIPMENT", "text": "Equipment & Artifacts" } }
                ]
            }
        }
    }
})