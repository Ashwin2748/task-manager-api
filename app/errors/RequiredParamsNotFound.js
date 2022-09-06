'use strict';

function RequiredParamasNotFound() {
    this.getMessage = function() {
        return "Invalid Parameters";
    };
    this.getStatusCode = function() {
        return 401;
    };
}

require("util").inherits(RequiredParamasNotFound, Error);

module.exports = RequiredParamasNotFound;
