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

  describe('after construction', function() {
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

