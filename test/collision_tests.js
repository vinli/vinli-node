var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli;

describe('Collision', function() {
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
      expect(Vinli.Collision).to.have.property('forge').that.is.a('function');
    });

    it('should return a Collision with the given id', function() {
      var collision = Vinli.Collision.forge('a095ae10-6e1f-4d46-a56f-b1855573e9cb');
      expect(collision).to.have.property('id', 'a095ae10-6e1f-4d46-a56f-b1855573e9cb');
    });
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.Collision).to.have.property('fetch').that.is.a('function');
    });

    it('should fetch a collision', function() {
      var collisionMock = nock('https://safety.vin.li')
        .get('/api/v1/collisions/19aac2ee-f6ae-4113-8d69-13d3bc349b1f')
        .reply(200, {
          collision: {
            id: '19aac2ee-f6ae-4113-8d69-13d3bc349b1f',
            location: {
              type: 'Point',
              coordinates: [ -96.917009, 32.766392 ]
            },
            timestamp: '2015-07-13T17:45:04.583Z',
            links: {
              self: 'https://safety.vin.li/api/v1/collisions/19aac2ee-f6ae-4113-8d69-13d3bc349b1f'
            }
          }
        });

      return Vinli.Collision.fetch('19aac2ee-f6ae-4113-8d69-13d3bc349b1f').then(function(collision) {
        expect(collision).to.be.an.instanceOf(Vinli.Collision);
        expect(collision).to.have.property('id', '19aac2ee-f6ae-4113-8d69-13d3bc349b1f');
        expect(collision.location).to.have.property('coordinates');
        expect(collision.links.self).to.contain('19aac2ee-f6ae-4113-8d69-13d3bc349b1f');
        collisionMock.done();
      });
    });

    it('should not fetch an unknown collision', function() {
      nock('https://safety.vin.li')
        .get('/api/v1/collisions/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, { message: 'Not found' });

      expect(Vinli.Collision.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });
});
