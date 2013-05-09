'use strict';

var YAML = require('yamljs'),
    _ = require('underscore')._,
    S = require('string');

exports.getOptions = function(e, defaults) {
  var opt, s = [];

  while ((e = e.next) && e.type !== 'tag') {
    if (e.type === 'comment') {
      s.push(S(e.data).trim().s);
    }
  }

  opt = YAML.parse(s.join('\n')) || {};

  return _.defaults(opt, defaults);
}

