var nock = require('nock');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

var Vinli;

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('App', function() {
  before(function() {
    Vinli = new (require('..'))({ appId: 'foo', secretKey: 'bar' });
  });

  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('.devices()', function() {
    it('should exist', function() {
      expect(Vinli.App).to.have.property('devices').that.is.a('function');
    });

    it('should return a "next page" function', function() {
      var m = nock('https://platform.vin.li')
        .get('/api/v1/devices?offset=0&limit=2').reply('200', {
          devices: [{
            id: '2248fff4-34fd-469c-9be7-8a1b5b13b4c7'
          }, {
            id: 'f20c8c54-bc48-49f7-ae98-ba756efdce71'
          }],
          meta: {
            pagination: {
              total: 3,
              limit: 2,
              offset: 0,
              links: {
                first: 'https://platform.vin.li/api/v1/devices?limit=2&offset=0',
                next: 'https://platform.vin.li/api/v1/devices?limit=2&offset=2',
                last: 'https://platform.vin.li/api/v1/devices?limit=2&offset=2'
              }
            }
          }
        });

      var n = nock('https://platform.vin.li')
        .get('/api/v1/devices?offset=2&limit=2').reply('200', {
          devices: [{
            id: '629cec1a-486f-4cc7-a437-e45314c62410'
          }],
          meta: {
            pagination: {
              total: 3,
              limit: 2,
              offset: 2,
              links: {
                first: 'https://platform.vin.li/api/v1/devices?limit=2&offset=0',
                prev: 'https://platform.vin.li/api/v1/devices?limit=2&offset=0',
                last: 'https://platform.vin.li/api/v1/devices?limit=2&offset=2'
              }
            }
          }
        });

      return Vinli.App.devices({ limit: 2 }).then(function(devices) {
        expect(devices).to.have.property('list');
        expect(devices).to.have.property('total', 3);
        expect(devices).to.have.property('next').that.is.a('function');
        expect(devices).to.have.property('first').that.is.a('function');
        expect(devices).to.have.property('last').that.is.a('function');
        m.done();
        return devices.next();
      }).then(function(devices) {
        expect(devices).to.have.property('list');
        expect(devices).to.have.property('total', 3);
        expect(devices).to.have.property('prev').that.is.a('function');
        expect(devices).to.have.property('first').that.is.a('function');
        expect(devices).to.have.property('last').that.is.a('function');
        n.done();
      });
    });
  });

  describe('.addDevice()', function() {
    it('should exist', function() {
      expect(Vinli.App).to.have.property('addDevice').that.is.a('function');
    });

    it('should let you add a device by device id', function() {
      var m = nock('https://platform.vin.li')
        .post('/api/v1/devices', {
          device: {
            id: 'foo'
          }
        }).reply('201', {
          device: {
            id: 'foo'
          }
        });
      return Vinli.App.addDevice({ id: 'foo' }).then(function(device) {
        expect(device).to.be.an.instanceOf(Vinli.Device);
        expect(device).to.have.property('id', 'foo');
        m.done();
      });
    });

    it('should let you add a device by case id', function() {
      var m = nock('https://platform.vin.li')
        .post('/api/v1/devices', {
          device: {
            caseId: 'VNL999'
          }
        }).reply('201', {
          device: {
            id: 'foo'
          }
        });
      return Vinli.App.addDevice({ caseId: 'VNL999' }).then(function(device) {
        expect(device).to.be.an.instanceOf(Vinli.Device);
        expect(device).to.have.property('id', 'foo');
        m.done();
      });
    });

    it('should not let you add a device by device id and case id', function() {
      expect(function() {
        Vinli.App.addDevice({ id: 'foo', caseId: 'VNL999' });
      }).to.throw(/id, caseId/);
    });

    it('should not let you add a device without device id or case id', function() {
      expect(function() {
        Vinli.App.addDevice({ id: 'foo', caseId: 'VNL999' });
      }).to.throw(/id, caseId/);
    });
  });
});