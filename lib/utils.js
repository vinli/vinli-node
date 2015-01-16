var Joi = require('joi');
var Hoek = require('hoek');
var yarp = require('yarp');
var URL = require('url'); /* jshint ignore:line */

exports.paginationOptions = Joi.object({
  offset: Joi.number().integer().min(0),
  limit: Joi.number().integer().min(0).max(100)
});

exports.streamPaginationOptions = Joi.object({
  limit: Joi.number().integer().min(0).max(100),
  since: Joi.date(),
  until: Joi.date()
});

exports.request = {
  buildUrl: function(_group, _path, _query, _skipPrefix){
    return URL.format({
      protocol: exports.request.options.protocol,
      hostname: _group + exports.request.options.hostBase,
      port: exports.request.options.port,
      pathname: (_skipPrefix ? '' : ('/api/' + exports.request.options.apiVersion)) + '/' + _path,
      query: _query
    });
  },

  _getRaw: function(url){
    return yarp({
      url: url,
      auth: {
        user: this.options.appId,
        pass: this.options.secretKey
      }
    });
  },

  authGet: function(_path, _accessToken) {
    return yarp({
      url: this.buildUrl('auth', _path, {'access_token': _accessToken}, true)
    });
  },

  get: function(_group, _path, _query){
    return this._getRaw(this.buildUrl(_group, _path, _query));
  },

  post: function(_group, _path, _payload, _skipPrefix){
    return yarp({
      url: exports.request.buildUrl(_group, _path, {}, _skipPrefix),
      method: 'POST',
      json: _payload,
      auth: {
        user: exports.request.options.appId,
        pass: exports.request.options.secretKey
      }
    });
  },

  put: function(_group, _path, _payload){
    return yarp({
      url: exports.request.buildUrl(_group, _path),
      method: 'PUT',
      json: _payload,
      auth: {
        user: exports.request.options.appId,
        pass: exports.request.options.secretKey
      }
    });
  },

  delete: function(_group, _path){
    return yarp({
      url: exports.request.buildUrl(_group, _path),
      method: 'DELETE',
      auth: {
        user: exports.request.options.appId,
        pass: exports.request.options.secretKey
      }
    });
  },

  getEntireStream: function(url, listName){
    return this._getRaw(url).then(function(data){
      if(data.meta.pagination.links.prior){
        return exports.request.getEntireStream(data.meta.pagination.links.prior, listName).then(function(locs){
          return data[listName].concat(locs);
        });
      } else {
        return data[listName];
      }
    });
  },

  getEntireLocationStream: function(url){
    return this._getRaw(url).then(function(data){
      if(data.meta.pagination.links.prior){
        return exports.request.getEntireLocationStream(data.meta.pagination.links.prior).then(function(locs){
          return data.locations.features.concat(locs);
        });
      } else {
        return data.locations.features;
      }
    });
  }
};

var linksToFunctions = function(links, func, thisObj){
  var tr = {};
  Object.keys(links).forEach(function(key){
    var url = URL.parse(links[key], true);
    tr[key] = function(){
      return thisObj ? func.call(thisObj, url.query) : func(url.query);
    };
  });

  return tr;
};

exports.listResponse = function(serverResp, listKey, func, thisObj){
  return Hoek.applyToDefaults({
    list: serverResp[listKey],
    total: serverResp.meta.pagination.total
  }, linksToFunctions(serverResp.meta.pagination.links, func, thisObj));
};

exports.streamListResponse = function(serverResp, listKey, func, thisObj){
  return Hoek.applyToDefaults({
    list: serverResp[listKey],
    remaining: serverResp.meta.pagination.remaining
  }, linksToFunctions(serverResp.meta.pagination.links, func, thisObj));
};