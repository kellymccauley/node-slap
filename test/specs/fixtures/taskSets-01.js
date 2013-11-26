'use strict';
var path = require('path')
  , u = require('util')
  , fileset = require('./build_lib/fileset')
  , context
;

context = taskSets.context;

taskSets.empty = {
  description: 'An empty task set.',
  tasks: [ ]
}

module.exports = taskSets;

