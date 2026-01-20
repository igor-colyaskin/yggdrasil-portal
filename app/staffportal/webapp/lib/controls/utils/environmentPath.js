sap.ui.define([],
	function () {
		"use strict";
		var bLocal = jQuery.sap.getUriParameters().get("local") === "true";
		return {

			getFolderPath: function () {
				return bLocal ? "/rootfolder/src/com/sap/fiorireuselibrary/ui5cardssdk/controls/webapp" : "/sap/bc/ui5_ui5/sap/rootfolder";

			}
		};
	});