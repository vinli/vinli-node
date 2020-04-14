var Utils = require('./utils');
var Joi = require('@hapi/joi');
var Hoek = require('@hapi/hoek');

module.exports = function(client) {
  return {
    addDevice: function(_options) {
      Joi.assert(_options, Joi.object().keys({
        id: Joi.string(),
        caseId: Joi.string()
      }).xor('id', 'caseId').required());

      return client.post('platform', 'devices', {
        device: _options
      }).then(function(resp) {
        return new client.Device({ id: resp.device.id, caseId: _options.caseId });
      });
    },

    removeDevice: function(deviceId) {
      Joi.assert(deviceId, Joi.string().required());

      return client.delete('platform', 'devices/' + deviceId);
    },

    devices: function(_options) {
      var self = this;
      _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options);
      Joi.assert(_options || {}, Utils.paginationOptions);

      return client.get('platform', 'devices', _options).then(function(resp) {
        resp.devices = resp.devices.map(function(v) { return new client.Device(v); });
        return Utils.listResponse(resp, 'devices', self.devices);
      });
    }
  };
};