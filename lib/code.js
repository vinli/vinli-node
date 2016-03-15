var Utils = require('./utils');
var Hoek = require('hoek');
var Joi = require('joi');
var extend = require('extend');

module.exports = function(client) {
  // Regex: (1)[PCBU] + (1)[0-3] + (3)[0-F]
  var pattern = /\b([PCBU]{1})([0-3]{1})([0-9|A-F|a-f]{3})\b/;

  var Code = function(_obj) {
    extend(this, _obj);
  };

  Code.fetch = function(id) {
    return client.get('diagnostic', 'codes/' + id).then(function(resp) {
      return new Code(resp.code);
    });
  };

  Code.search = function(number, _options) {
    var self = this;
    _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options || {});
    Joi.assert(_options, Utils.paginationOptions);
    _options = Hoek.merge({ number: number }, _options);
    Joi.assert(number, Joi.string().length(5).regex(pattern));

    return client.get('diagnostic', 'codes', _options).then(function(resp) {
      resp.codes = resp.codes.map(function(v) { return new client.Code(v); });
      return Utils.listResponse(resp, 'codes', self.codes, self);
    });
  };

  return Code;
};
