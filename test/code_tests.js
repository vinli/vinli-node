var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli;

describe('Code', function() {
  before(function() {
    Vinli = new (require('..'))({ appId: 'foo', secretKey: 'bar' });
  });

  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.Code).to.have.property('fetch').that.is.a('function');
    });

    it('should fetch a code with the given id from the platform', function() {
      var m = nock('https://diagnostic.vin.li')
        .get('/api/v1/codes/fec0bf34-eb4e-49e2-b17c-83e21ff5d03a')
        .reply(200, {
          code: {
            id: 'fec0bf34-eb4e-49e2-b17c-83e21ff5d03a',
            codeId: 'P0100'
          }
        });

      return Vinli.Code.fetch('fec0bf34-eb4e-49e2-b17c-83e21ff5d03a')
        .then(function(diagnostic) {
          expect(diagnostic).to.be.an.instanceOf(Vinli.Code);
          expect(diagnostic).to.have.property('id', 'fec0bf34-eb4e-49e2-b17c-83e21ff5d03a');
          m.done();
        });
    });

    it('should reject a request for an unknown code', function() {
      nock('https://diagnostic.vin.li')
        .get('/api/v1/codes/fec0bf34-eb4e-49e2-b17c-83e21ff5d03a')
        .reply(404, { message: 'Not found' });

      expect(Vinli.Code.fetch('fec0bf34-eb4e-49e2-b17c-83e21ff5d03a')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('.search(number)', function() {
    it('should exist', function() {
      expect(Vinli.Code).to.have.property('search').that.is.a('function');
    });

    it('should search codes with a given number', function() {
      var m = nock('https://diagnostic.vin.li')
        .get('/api/v1/codes?number=P0101&offset=0&limit=20')
        .reply(200, {
          codes: [
            {
              id: '5b68e663-994c-4855-940b-004f74607b23',
              number: 'P0101'
            },
            {
              id: 'bd5a03e7-e86f-481d-bf14-84f14b8adc2b',
              number: 'P0101'
            },
            {
              id: '6df3c9e1-0166-4544-9050-543edfd06f10',
              number: 'P0101'
            }
          ],
          meta: {
            pagination: {
              total: 4,
              limit: 3,
              offset: 0,
              links: {
                first: '/api/v1/codes?number=P0101&limit=3&offset=0&sortDirection=desc',
                next: '/api/v1/codes?number=P0101&limit=3&offset=3&sortDirection=desc',
                last: '/api/v1/codes?number=P0101&limit=3&offset=3&sortDirection=desc'
              }
            }
          }
        });

      return Vinli.Code.search('P0101')
        .then(function(codes) {
          expect(codes).to.have.property('list').that.is.an('array');
          expect(codes.list).to.have.lengthOf(3);
          expect(codes.list[0]).to.be.an.instanceOf(Vinli.Code);
          expect(codes).to.have.property('total', 4);
          expect(codes).to.have.property('next').that.is.a('function');

          m.done();
        });
    });
  });
});
