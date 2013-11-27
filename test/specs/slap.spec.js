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
var should = require('should')
  , path = require('path')
  , debug = require('debug')('slap:spec')
  , Slap = require('../../slap')
  , helper = require('../../helper')
  , specDir = __dirname
  , fixtureDir = path.join(__dirname, 'fixtures')
;

describe('Slap', function() {

  it('should be constructed with a config object and a callback function to be executed when the run() function is finished.', function() {
    var config
      , onFinishedCallback
      , slap
    ;

    config = {
      taskSetsFile: path.join(fixtureDir, 'taskSets-01.js'),
      reportLevel: helper.reportLevel['error']
    }

    onFinishedCallback = function(err, msg, exitCode) {
      should.not.exist(err);
      should.not.exist(msg);
      should.not.exist(exitCode);
    }

    slap = new Slap(config, onFinishedCallback);

  });

  describe('After construction', function() {
    var config;

    config = {
      taskSetsFile: path.join(fixtureDir, 'taskSets-01.js'),
      reportLevel: helper.reportLevel['internal4']
    }



    it('should resolve the path to the file containing the task sets.', function() {
      var onFinishedCallback, slap;

      onFinishedCallback = function(err, msg, exitCode) {
        should.not.exist(err);
        should.not.exist(msg);
        should.not.exist(exitCode);
      }

      slap = new Slap(config, onFinishedCallback);

      // slap.on(helper.events.RESOLVING_TASK_SETS_FILE, function(slap, taskSetsFile) {
      // });
      
      slap.resolveTaskSetsFile().should.be.ok;
    });


  });

});

