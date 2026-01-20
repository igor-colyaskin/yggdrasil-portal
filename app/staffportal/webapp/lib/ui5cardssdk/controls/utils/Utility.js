sap.ui.define([

], function ( ) {

	"use strict";

	return {
		/**
		 * Method converts date with offset to UTC
		 * @public
		 */
		parseDateToUTC: function (oDateValue) {
			if (!oDateValue) {
				return oDateValue;
			}

			var iMilliseconds = oDateValue.getTime();
			var oDateWithTimeZone = new Date(iMilliseconds);

			return new Date(oDateWithTimeZone.getTime() + (oDateWithTimeZone.getTimezoneOffset() * 60000));
		},

		/**
		 * Method converts date without offset to local time
		 * @public
		 */
		parseDateFromUTC: function (oDateValue) {
			if (!oDateValue) {
				return oDateValue;
			}

			var iMilliseconds = oDateValue.getTime();
			var oDateWithTimeZone = new Date(iMilliseconds);

			return new Date(oDateWithTimeZone.getTime() - (oDateWithTimeZone.getTimezoneOffset() * 60000));
		},

		/**
		 * Method return date with time 00:00 without offset to UTC
		 * 01.02.2023 03:00 GTM+0300
		 * @public
		 */
		parseDateTo0000WithoutOffset: function (oDateValue) {
			if (!oDateValue) {
				return oDateValue;
			}

			var iMilliseconds = oDateValue.getTime();
			var oDateWithTimeZone = new Date(iMilliseconds);
			oDateWithTimeZone.setHours(0, 0, 0, 0);
			return new Date(oDateWithTimeZone.getTime() - (oDateWithTimeZone.getTimezoneOffset() * 60000));
		},



		fnoDataCreate: function (oModel, sURL, urlParameters, oData) {
			return new Promise(function (resolve, reject) {
				var mParameters = {
					urlParameters: urlParameters,
					async: true,
					success: function (oResponseData) {
						resolve(oResponseData);
					},
					error: this.fnOnRequestError.bind(this, reject)
				};
				oModel.create(sURL, oData, mParameters);
			}.bind(this));
		},

		
	};

});