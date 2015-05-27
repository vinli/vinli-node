var expect = require('chai').expect;

exports.test = function(Vinli) {
  return Vinli.App.devices().then(function(devices) {
    return [
      devices.list[0].locations({ limit: 3 }),
      devices.list[0].messages({ limit: 3 }),
      devices.list[0].snapshots({ limit: 3, fields: [ 'rpm', 'coolantTemp', 'vehicleSpeed' ] })
    ];
  }).all().spread(function(locations, messages, snapshots) {
    var next = [];

    expect(locations.list.features).to.be.an('array');
    expect(locations.remaining).to.be.a('number');
    if (locations.remaining > 0) {
      expect(locations.list.features).to.have.length(3);
      next.push(locations.prior());
    }

    expect(messages.list).to.be.an('array');
    expect(messages.remaining).to.be.a('number');
    if (messages.remaining > 0) {
      expect(messages.list).to.have.length(3);
      next.push(messages.prior());
    }

    expect(snapshots.list).to.be.an('array');
    expect(snapshots.remaining).to.be.a('number');
    if (snapshots.remaining > 0) {
      expect(snapshots.list).to.have.length(3);
      next.push(snapshots.prior());
    }

    return next;
  }).all().then(function(responses) {
    responses.forEach(function(resp) {
      expect(resp.remaining).to.be.a('number');
    });
  });
};