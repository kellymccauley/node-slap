/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013 Kelly McCauley
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
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

