var nock = require('nock');

if (process.env.VINLI_APP_ID && process.env.VINLI_SECRET_KEY) {
  describe.only('Vinli Integration', function() {
    var Vinli;

    before(function() {
      Vinli = require('../..')({ appId: process.env.VINLI_APP_ID, secretKey: process.env.VINLI_SECRET_KEY, hostBase: '-dev.vin.li' });
      nock.enableNetConnect();
    });

    after(function() {
      nock.disableNetConnect();
    });

    it('should integrate with telemetry service', function() {
      return require('./telemetry').test(Vinli);
    });

    it('should integrate with event service', function() {
      return require('./event').test(Vinli);
    });
  });
}