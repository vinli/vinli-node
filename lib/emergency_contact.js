var Utils = require('./utils');
var extend = require('extend');

var EmergencyContact = function(_obj) {
  console.log('[VINLI] EmergencyContact is deprecated and will be removed in 1.0.0.');
  extend(this, _obj);
};

EmergencyContact.prototype.update = function(payload) {
  return Utils.request.put('safety', 'emergency_contacts/' + this.id, { emergencyContact: payload }).then(function(resp) {
    return new EmergencyContact(resp.emergencyContact);
  });
};

EmergencyContact.prototype.delete = function() {
  return Utils.request.delete('safety', 'emergency_contacts/' + this.id).then(function() {
    return;
  });
};

EmergencyContact.prototype.test = function() {
  return Utils.request.post('safety', 'emergency_contacts/' + this.id + '/tests');
};

EmergencyContact.fetch = function(id) {
  return Utils.request.get('safety', 'emergency_contacts/' + id).then(function(resp) {
    return new EmergencyContact(resp.emergencyContact);
  });
};

EmergencyContact.forge = function(id) {
  return new EmergencyContact({ id: id });
};

module.exports = EmergencyContact;