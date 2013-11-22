'use strict';
var path = require('path')
  , u = require('util')
  , debug = require('debug')('slap:reporter')
  , darkBgColors
  , lightBgColors

;

darkBgColors = {
  error: ['red', 'bold'],
  warning: ['yellow'],
  notice: ['green'],
  info: null,
  debug: null,
  trace: null,
  internal: null,
  taskSetName: ['magenta', 'bold'],
  taskName: ['cyan', 'bold'],
  logKeyLBracket: ['bold'],
  logKey1: ['magenta', 'bold'],
  logKeySep: ['bold'],
  logKey2: ['cyan', 'bold'],
  logKeyRest: ['green', 'bold'],
  logKeyRBracket: ['bold']
}

lightBgColors = {
  error: ['red', 'bold'],
  warning: ['yellow'],
  notice: ['green'],
  info: null,
  debug: null,
  trace: null,
  internal: null
  taskSetName: ['magenta', 'bold'],
  taskName: ['cyan', 'bold'],
  logKeyLBracket: ['bold'],
  logKey1: ['magenta', 'bold'],
  logKeySep: ['bold'],
  logKey2: ['cyan', 'bold'],
  logKeyRest: ['green', 'bold'],
  logKeyRBracket: ['bold']
}


function BaseReporter(slap) {
  'use strict';
  if (!slap) {
    throw new Error("The `slap` argument is required");
  }
  this.slap = slap;
  this.reportLevel = this.slap.config.reportLevel;

  this.config = {
    colors: darkBgColors
  };

  if (runConfig.outputBackgroundType && runConfig.outputBackgroundType === 'light') {
    this.config.colors = lightBgColors;
  }


}

exports = module.exports = BaseReporter;
