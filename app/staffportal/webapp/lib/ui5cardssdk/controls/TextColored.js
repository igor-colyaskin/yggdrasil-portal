sap.ui.define([
	"sap/m/Text"
], function (Text) {
	"use strict";
	return Text.extend("com.sap.fiorireuselibrary.ui5cardssdk.controls.TextColored", {
		metadata: {
			properties: {
				color: {
					type: "string",
					defaultValue: ""
				}
			}
		},
		renderer: {},

		onAfterRendering: function () {
			Text.prototype.onAfterRendering.apply(this, arguments);

			var sColor = this.getColor();
			if (document.querySelector("html.sapUiTheme-sap_belize_hcb")) {
				if (sColor === "Error") sColor = "#ff5e55";
				if (sColor === "Warning") sColor = "#ffab10";
				if (sColor === "Success") sColor = "#99cc90";
				if (sColor === "Information") sColor = "#7a5101";
			} else {
				if (sColor === "Error") sColor = "#EE0000";
				if (sColor === "Warning") sColor = "#FFAA00";
				if (sColor === "Success") sColor = "#107E3E";
				if (sColor === "Information") sColor = "#0A6ED1";
			}

			this.$().css("color", sColor || "");
		}
	});
});