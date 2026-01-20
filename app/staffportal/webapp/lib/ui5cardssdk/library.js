/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library com.sap.fiorireuselibrary.ui5cardssdk.
 */
sap.ui.define(
    ["sap/ui/core/Lib", "sap/ui/base/DataType", "./CommonActions", "./CommonAssertions", "./StorageUtils", "./ErrorHandler"],
    function (Lib, DataType, CommonActions, CommonAssertions, StorageUtils, ErrorHandler) {
        "use strict";

        // delegate further initialization of this library to the Core
        // Hint: sap.ui.getCore() must still be used to support preload with sync bootstrap!
        Lib.init({
            name: "com.sap.fiorireuselibrary.ui5cardssdk",
            version: "${version}",
            dependencies: [
                // keep in sync with the ui5.yaml and .library files
                "sap.ui.core"
            ],
            types: ["com.sap.fiorireuselibrary.ui5cardssdk.ExampleColor"],
            interfaces: [

            ],
            controls: [
                // "com.sap.fiorireuselibrary.ui5cardssdk.Example"
            ],
            elements: [],
            noLibraryCSS: true, // if no CSS is provided, you can disable the library.css load here
            apiVersion: 2
        });

        /**
         * Some description about <code>ui5cardssdk</code>
         *
         * @namespace
         * @name com.sap.fiorireuselibrary.ui5cardssdk
         * @author Fiori tools
         * @version ${version}
         * @public
         */
        // eslint-disable-line
        var thisLib = com.sap.fiorireuselibrary.ui5cardssdk;

        /**
         * Semantic Colors of the <code>com.sap.fiorireuselibrary.ui5cardssdk.Example</code>.
         *
         * @enum {string}
         * @public
         */
        thisLib.ExampleColor = {
            /**
             * Default color (brand color)
             * @public
             */
            Default: "Default",

            /**
             * Highlight color
             * @public
             */
            Highlight: "Highlight"
        };

        DataType.registerEnum("com.sap.fiorireuselibrary.ui5cardssdk.ExampleColor", thisLib.ExampleColor);

        if (!thisLib.OPA5Helper) {
            thisLib.OPA5Helper = {
                actions: CommonActions,
                assertions: CommonAssertions,
                getTest: function () {
                    return "test";
                },
                bFinal: false /* if true, the helper must not be overwritten by an other library */
            };
        }

        thisLib.StorageUtils = thisLib.StorageUtils || StorageUtils;
        thisLib.ErrorHandler = thisLib.ErrorHandler || ErrorHandler

        return thisLib;
    }
);