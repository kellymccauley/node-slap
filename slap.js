'use strict';
var slap
  , u = require('util')
  , _ = require('lodash')
  , clc = require('cli-color')
  , context = require('./context')
  , debug = require('debug')('slap')
  , taskFile;

slap = module.exports = function(config, taskSets, taskSetName, callback) {
  'use strict';
  var _err, errMsg, taskSet, logKey, deps, completed, completedPropKey;

  if (taskSets.context) {
    context = taskSets.context
  }

  taskSet = taskSets[taskSetName];
  if (!taskSet) {
    errMsg = u.format("Could not find the taskSet named %s.", taskSetName);
    console.log(clc.bold.red(errMsg));
    callback(new Error(errMsg));
    return;
  }

  logKey = [clc.bold('['), clc.bold.green(taskSetName), clc.bold(']')].join('');

  deps = _.result(taskSet, 'deps');

  if (deps) {
    console.log('%s Running %s dependant task sets ...', logKey, clc.bold.cyan(taskSetName));
    if (_.isString(deps)) {
      deps = [deps];
    }

    // Do the dependencies first.
    _.each(deps, function(depTaskSetName) {
      // console.log('%s %s depends on %s.', logKey, taskSetName, depTaskSetName);
      // console.log();
      slap(config, taskSets, depTaskSetName, function(err) {
        _err = err;
        return false;
      });
    });
  }

  if (!_err && taskSet.tasks && taskSet.tasks.length > 0) {
    completedPropKey = ['slap', taskSetName, 'completed'].join('.');
    completed = context.resolveProperty(completedPropKey, {createIfMissing: false});

    if (!completed) {
      console.log('%s Running %s tasks ...', logKey, clc.bold.cyan(taskSetName));
      _.each(taskSet.tasks, function(taskConfig) {
        'use strict';
        if (taskConfig.task) {
          // taskConfig.task(config, taskSets, taskSetName, taskConfig, function(err) {
          taskConfig.task(taskSetName, taskConfig, taskSets, config, function(err) {
            if (err) _err = err;
          });

          if (_err) return false;

        } else {
          debug("%s Task without a task function specified: %s", logKey, u.inspect(taskConfig));
        }
      });

      if (_err) {
        console.log(clc.bold.red(u.format('%s Unable to complete task set: %s', logKey, taskSetName)));

      } else {
        console.log('%s Finished running %s tasks.', logKey, clc.bold.cyan(taskSetName));
        context.setProperty(completedPropKey, true);

      }

    }

  }

  callback(_err);
};

