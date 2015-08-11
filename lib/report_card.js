var extend = require('extend');

module.exports = function(client) {
  var ReportCard = function(_obj) {
    extend(this, _obj);
  };

  ReportCard.fetch = function(id) {
    return client.get('behavioral', 'report_cards/' + id).then(function(resp) {
      return new ReportCard(resp.reportCard);
    });
  };

  ReportCard.forge = function(id) {
    return new ReportCard({ id: id });
  };

  return ReportCard;
};
