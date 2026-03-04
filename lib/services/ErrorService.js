"use strict";

module.exports = {
    throwTokenError: function() {
        throw new Error("UAA token cannot be null. Token is required before making API calls.");
    }
};
