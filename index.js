var util = require('./util.js'),
    GoogleMapsAPI = require('googlemaps');

var pickInputs = {
        'locations': 'locations',
        'path': 'path'
    },
    pickOutputs = {
        'location': {
            keyName: 'results',
            fields: ['location']
        },
        'elevation': {
            keyName: 'results',
            fields: ['elevation']
        },
        'resolution': {
            keyName: 'results',
            fields: ['resolution']
        }
    };

module.exports = {

    /**
     * Get auth data.
     *
     * @param step
     *
     * @param dexter
     * @returns {*}
     */
    authOptions: function (step, dexter) {
        var authData = {};

        if (dexter.environment('google_server_key')) {
            authData.key = dexter.environment('google_server_key');
        }

        if (dexter.environment('google_client_id') && dexter.environment('google_private_key')) {
            authData.google_client_id = dexter.environment('google_client_id');
            authData.google_private_key = dexter.environment('google_private_key');
        }

        return authData;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var auth = this.authOptions(step, dexter);
        if (!Object.keys(auth).length)
            return this.fail('A [google_server_key] (or [google_client_id,google_private_key] for enterprise) environment variable need for this module.');

        var gmAPI = new GoogleMapsAPI(auth);
        gmAPI.elevationFromLocations(util.pickInputs(step, pickInputs), function(err, result) {
            if (err)
                this.fail(err);

            if (result && result.error_message)
                this.fail(result.error_message);
            else
                this.complete(util.pickOutputs(result, pickOutputs));
        }.bind(this));
    }
};
