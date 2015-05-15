var Utils = require('./utils');
var Device = require('./device');
var Joi = require('joi');
var Hoek = require('hoek');

exports.addDevice = function(_options) {
  Joi.assert(_options, Joi.object().keys({
    id: Joi.string(),
    caseId: Joi.string()
  }).xor('id', 'caseId').required());

  return Utils.request.post('platform', 'devices', {
    device: _options
  }).then(function(resp) {
    return new Device({ id: resp.device.id, caseId: _options.caseId });
  });
};

exports.devices = function(_options) {
    _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options);
  Joi.assert(_options || {}, Utils.paginationOptions);

  return Utils.request.get('platform', 'devices', _options).then(function(resp) {
    resp.devices = resp.devices.map(function(v) { return new Device(v); });
    return Utils.listResponse(resp, 'devices', exports.devices);
  });
};