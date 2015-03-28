var Utils = require('./utils');
var Hoek = require('hoek');
var Joi = require('joi');
var Vehicle = require('./vehicle');
var Trip = require('./trip');
var Rule = require('./rule');
var EmergencyContact = require('./emergency_contact');
var extend = require('extend');

var Device = function(_obj){
  extend(this, _obj);
};

Device.prototype.type = 'Device';

Device.prototype.vehicles = function(_options){
  var self = this;
  _options = Hoek.applyToDefaults({offset: 0, limit: 20}, _options);
  Joi.assert(_options || {}, Utils.paginationOptions);

  return Utils.request.get(
    'platform',
    'devices/'+this.id+'/vehicles',
    _options
  ).then(function(resp){
    resp.vehicles = resp.vehicles.map(function(v){ return new Vehicle(v); });
    return Utils.listResponse(resp, 'vehicles', self.vehicles, self);
  });
};

Device.prototype.latestVehicle = function(){
  return Utils.request.get(
    'platform',
    'devices/'+this.id+'/vehicles/_latest'
  ).then(function(resp){
    if(!resp.vehicle) {
      return null;
    }
    return new Vehicle(resp.vehicle);
  });
};

Device.prototype.messages = function(_options){
  var self = this;
  _options = Hoek.applyToDefaults({limit: 20}, _options || {});
  Joi.assert(_options, Utils.streamPaginationOptions);

  return Utils.request.get(
    'telemetry',
    'devices/'+self.id+'/messages',
    _options).then(function(resp){
      return Utils.streamListResponse(resp, 'messages', self.messages, self);
    });
};

Device.prototype.message = function(messageId){
  return Utils.request.get(
    'telemetry',
    'devices/'+this.id+'/messages/'+messageId
  ).then(function(resp){
    return resp.message;
  });
};

Device.prototype.snapshots = function(fields, _options){
  var self = this;
  Joi.assert(fields, Joi.array().min(1));
  _options = Hoek.applyToDefaults({limit: 20}, _options || {});
  Joi.assert(_options, Utils.streamPaginationOptions);

  _options.fields = fields.join(',');

  return Utils.request.get(
    'telemetry',
    'devices/'+self.id+'/snapshots',
    _options).then(function(resp){
      return Utils.streamListResponse(resp, 'snapshots', self.snapshots, self);
    });
};

Device.prototype.locations = function(_options){
  var self = this;
  _options = Hoek.applyToDefaults({limit: 20}, _options || {});
  Joi.assert(_options, Utils.streamPaginationOptions);

  return Utils.request.get(
    'telemetry',
    'devices/'+self.id+'/locations',
    _options).then(function(resp){
      return Utils.streamListResponse(resp, 'locations', self.locations, self);
    });
};

Device.prototype.trips = function(_options){
  var self = this;
  _options = Hoek.applyToDefaults({offset: 0, limit: 20}, _options || {});
  Joi.assert(_options, Utils.paginationOptions);

  return Utils.request.get(
    'trips',
    'devices/'+this.id+'/trips',
    _options).then(function(resp){
      resp.trips = resp.trips.map(function(v){ return new Trip(v); });
      return Utils.listResponse(resp, 'trips', self.trips, self);
    });
};

Device.prototype.rules = function(_options){
  var self = this;
  _options = Hoek.applyToDefaults({offset: 0, limit: 20}, _options || {});
  Joi.assert(_options, Utils.paginationOptions);

  return Utils.request.get(
    'events',
    'devices/'+this.id+'/rules',
    _options).then(function(resp){
      resp.rules = resp.rules.map(function(v){ return new Rule(v); });
      return Utils.listResponse(resp, 'rules', self.rules, self);
    });
};


Device.prototype.createRule = function(_payload){
  return Utils.request.post(
    'events',
    'devices/'+this.id+'/rules',
    {rule: _payload}).then(function(resp){
      console.log(resp)
      return new Rule(resp.rule);
    });
};

Device.prototype.emergencyContacts = function(_options){
  var self = this;
  _options = Hoek.applyToDefaults({offset: 0, limit: 20}, _options || {});
  Joi.assert(_options, Utils.paginationOptions);

  return Utils.request.get(
    'safety',
    'devices/'+this.id+'/emergency_contacts',
    _options).then(function(resp){
      resp.trips = resp.emergencyContacts.map(function(v){ return new EmergencyContact(v); });
      return Utils.listResponse(resp, 'emergencyContacts', self.emergencyContacts, self);
    });
};


Device.prototype.createEmergencyContact = function(_payload){
  return Utils.request.post(
    'safety',
    'devices/'+this.id+'/emergency_contacts',
    {emergencyContact: _payload}).then(function(resp){
      return new EmergencyContact(resp.emergencyContact);
    });
};

Device.fetch = function(id){
  return Utils.request.get('platform', 'devices/'+id).then(function(resp){
    return new Device(resp.device);
  });
};

Device.forge = function(id){
  return new Device({id: id});
};

module.exports = Device;