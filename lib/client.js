var Hoek = require('hoek');
var Joi = require('joi');
var Utils = require('./utils');

var defaultOptions = {
  hostBase: '.vin.li',
  protocol: 'https',
  port: 443,
  apiVersion: 'v1'
};

module.exports = function(_options) {
  this.options = Hoek.applyToDefaults(defaultOptions, _options);

  Joi.assert(this.options, Joi.object({
    hostBase: Joi.string().required().regex(/^[-_\.\da-zA-Z]+$/),
    protocol: Joi.string().required().allow([ 'http', 'https' ]),
    port: Joi.number().integer().required().min(1),
    apiVersion: Joi.string().required(),
    appId: Joi.string().required(),
    secretKey: Joi.string().required()
  }).required());

  Utils.request.options = this.options;

  return {
    App: require('./app'),
    Device: require('./device'),
    Vehicle: require('./vehicle'),
    Trip: require('./trip'),
    User: require('./user'),
    Rule: require('./rule'),
    EmergencyContact: require('./emergency_contact'),
    Auth: require('./auth')
  };
};
