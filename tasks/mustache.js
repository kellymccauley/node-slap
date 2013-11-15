'use strict';
var path = require('path')
  , u = require('util')
  , fs = require('fs-extra')
  , shell = require('shelljs')
  , mustache = require('mustache')
  , debug = require('debug')('slap:task:mustache')
  ;

module.exports = function(config, taskSets, taskSetName, taskConfig, callback) {
  'use strict';
  var logKey
    , errMsg
    , _err
    ;

  logKey = ['[', taskSetName, ':mustache', ']'].join('');

  callback(_err);

};


