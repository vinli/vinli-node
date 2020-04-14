var Joi = require('@hapi/joi');
var Hoek = require('@hapi/hoek');
var URL = require('url');

exports.paginationOptions = Joi.object({
  offset: Joi.number().integer().min(0),
  limit: Joi.number().integer().min(0).max(100)
});

exports.streamPaginationOptions = Joi.object({
  limit: Joi.number().integer().min(0).max(100),
  since: Joi.date(),
  until: Joi.date()
});

var linksToFunctions = function(links, func, thisObj) {
  var tr = {};
  Object.keys(links).forEach(function(key) {
    var url = URL.parse(links[key], true);
    tr[key] = function() {
      return thisObj ? func.call(thisObj, url.query) : func(url.query);
    };
  });

  return tr;
};

exports.listResponse = function(serverResp, listKey, func, thisObj) {
  return Hoek.applyToDefaults({
    list: serverResp[listKey],
    total: serverResp.meta.pagination.total
  }, linksToFunctions(serverResp.meta.pagination.links, func, thisObj));
};

exports.streamListResponse = function(serverResp, listKey, func, thisObj) {
  return Hoek.applyToDefaults({
    list: serverResp[listKey],
    remaining: serverResp.meta.pagination.remaining
  }, linksToFunctions(serverResp.meta.pagination.links, func, thisObj));
};
