var nock = require('nock');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

var Vinli;

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Auth', function() {
  before(function() {
    Vinli = require('..')({ appId: 'foo', secretKey: 'bar' });
  });

  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('.exchange()', function() {
    it('should exist', function() {
      expect(Vinli.Auth).to.have.property('exchange').that.is.a('function');
    });

    it('should require an authCode, redirectUrl, clientId and clientSecret');

    it('should return an access token');
  });
});