var expect = require('chai').expect;

exports.test = function(Vinli) {
  return Vinli.App.devices().then(function(devices) {
    return [
      devices.list[0].events({ limit: 3 }),
      devices.list[0].events({ type: 'startup', limit: 3 })
    ];
  }).all().spread(function(events, startups) {
    console.log(events)
  });
};