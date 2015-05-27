var yarp = require('yarp');

module.exports = function(client) {
  var Auth = { };

  Auth.exchange = function(authCode, redirectUri, clientId, clientSecret) {
    return yarp({
      url: client.buildUrl('auth', 'oauth/token', {}, true),
      method: 'POST',
      json: {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri
      },
      auth: {
        user: clientId,
        pass: clientSecret
      }
    }).then(function(resp) {
      return resp.access_token;
    });
  };

  return Auth;
};