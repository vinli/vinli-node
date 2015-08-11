var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli;

describe('ReportCard', function() {
  before(function() {
    Vinli = new (require('..'))({ appId: 'foo', secretKey: 'bar' });
  });

  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('.forge(id)', function() {
    it('should exist', function() {
      expect(Vinli.ReportCard).to.have.property('forge').that.is.a('function');
    });

    it('should return a ReportCard with the given id', function() {
      var reportCard = Vinli.ReportCard.forge('a095ae10-6e1f-4d46-a56f-b1855573e9cb');
      expect(reportCard).to.have.property('id', 'a095ae10-6e1f-4d46-a56f-b1855573e9cb');
    });
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.ReportCard).to.have.property('fetch').that.is.a('function');
    });

    it('should fetch a report card given the id', function() {
      var reportCardId = 'c4150a36-4f52-4894-8a36-ac413861d657';
      var reportCardNock = nock('https://behavioral.vin.li')
        .get('/api/v1/report_cards/' + reportCardId)
        .reply(200, {
          reportCard: {
            id: reportCardId,
            deviceId: '64013359-093a-4ed1-bd5f-cb47deaea262',
            vehicleId: 'ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55',
            tripId: '4bd620f6-feee-441f-88ad-551aec2944f5',
            grade: 'A',
            links: {
              self: 'https://behavioral-dev.vin.li/api/v1/report_cards/c4150a36-4f52-4894-8a36-ac413861d657',
              trip: 'https://trips-dev.vin.li/api/v1/trips/4bd620f6-feee-441f-88ad-551aec2944f5',
              device: 'https://platform-dev.vin.li/api/v1/devices/64013359-093a-4ed1-bd5f-cb47deaea262',
              vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55'
            }
          }
        });

      return Vinli.ReportCard.fetch(reportCardId).then(function(reportCard) {
        expect(reportCard).to.be.an.instanceOf(Vinli.ReportCard);
        expect(reportCard).to.have.property('id', reportCardId);
        expect(reportCard).to.have.property('deviceId');
        expect(reportCard).to.have.property('vehicleId');
        expect(reportCard).to.have.property('tripId');
        expect(reportCard).to.have.property('grade', 'A');
        expect(reportCard.links.self).to.contain(reportCardId);
        reportCardNock.done();
      });
    });

    it('should not fetch an unknown report card', function() {
      nock('https://behavioral.vin.li')
        .get('/api/v1/report_cards/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, { message: 'Not found' });

      expect(Vinli.ReportCard.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });
});
