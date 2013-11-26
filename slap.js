'use strict';
var slap
  , EventEmitter = require('events').EventEmitter
  , path = require('path')
  , u = require('util')
  , _ = require('lodash')
  , fs = require('fs')
  , findup = require('findup-sync')
  , debug = require('debug')('slap')

  , context = require('./context')
  , helper = require('./helper')
  , Task = require('./task').Task
;

_.str = require('underscore.string');
_.mixin(_.str.exports());


function Slap(runConfig, onFinishedCallback) {
  'use strict';
  var cfg
  ;

  cfg = {
    baseDir: baseDir,
    taskSetsFile: 'taskSets.js',
    taskSetsToRun: [],
    useColors: true,
    reportLevel: helper.reportLevel['info'],
  };

  this.config = _.assign(cfg, runConfig);

  this.context = context;

  this.canContinue = true;
  this.lastErr = null;
  this.lastExtraErrMsg = null;
  this.lastErrArgs = [];
  this.exitCode = 0;

  this.taskSets = {};

  this._logKeyStackStack = [];
  this._logKeyStack = [];

  global['createTask'] = this.createTask;
  global['simpleTask'] = this.simpleTask;
  global['descriptiveTask'] = this.descriptiveTask;
  global['echo'] = this.echo;
}

u.inherits(Slap, EventEmitter);

module.exports.Slap = Slap;


Slap.prototype.run = function() {
  'use strict';
  var self = this
    , config = this.config
    , _err
    , errMsg
    , exitCode
    , taskSets
  ;


  // Resolve the file containing the task sets.
  this.emit(helper.events.RESOLVING_TASK_SETS_FILE, this, config.taskSetsFile);

  config.taskSetsFile = path.resolve(findup(config.taskSetsFile, {nocase: true}));

  if (!fs.existsSync(config.taskSetsFile)) {
    _err = new Error(u.format("File not found: %s", config.taskSetsFile));
    _err.exitCode = helper.exitCode.FILE_NOT_FOUND;
    return !this.encounteredError(_err, null, null, [config.taskSetsFile]);

  }

  this.emit(helper.events.RESOLVING_TASK_SETS_FILE_FINISHED, this, config.taskSetsFile);

  // Load the task sets as a module.
  this.emit(helper.events.LOADING_TASK_SETS_FILE, this, config.taskSetsFile);
  try {
    taskSets = require(config.taskSetsFile);
    this.taskSets = taskSets;

  } catch (err) {
    errMsg = u.format("Unable to load the task sets from: %s", config.taskSetsFile);
    return !this.encounteredError(err, null, errMsg, [config.taskSetsFile]);
  }

  this.emit(helper.events.LOADING_TASK_SETS_FILE_FINISHED, this, config.taskSetsFile);

  // Set the default task set, if necessary.
  if (config.taskSetsToRun.length === 0) {
    if (taskSets['default']) {
      config.taskSetsToRun.push('default');
    }
  }

  debug("config:\n%s", u.inspect(config, {depth: 4}));

  // If the task sets has a context, use it.
  if (taskSets.context) {
    this.context = taskSets.context
  }

  // Run each the specified task sets.
  _.each(config.taskSetsToRun, this.runTaskSet);

  return this.canContinue

};

/**
 * Run the task set with the given `taskSetName`.
 *
 * @returns {boolean} If the task set completed successfully.
 */
Slap.prototype.runTaskSet = function(taskSetName) {
  'use strict';
  var self = this
    , _err
    , errMsg
    , result = true;
    , taskSet
    , tasks
    , tasksKey
    , deps
    , depsKey
  ;

  this.pushLogKey(taskSetName);

  taskSet = taskSets[taskSetName];

  try {
    if (taskSet) {
      // Run the task set's dependencies, if necessary.
      depsKey = (helper.findPropertyNames(taskSet, /^(?:deps|dependen).*/))[0];
      deps = _.result(taskSet, depsKey);

      if (deps) {
        // We have dependencies.
        if (_.isString(deps)) {
          deps = [deps];
        }

        this.emit(helper.events.RUNNING_DEPENDENT_TASK_SETS, this, taskSetName, taskSet);

        // Run the dependant.
        _.each(deps, function(depTaskSetName) {
          return self.runTaskSet(depTaskSetName);
        });

        if (this.canContinue) {
          // Keep going.
          this.emit(helper.events.RUNNING_DEPENDENT_TASK_SETS_FINISHED, this, taskSetName, taskSet);

        }

      }

      if (this.canContinue) {
        // Now we can run the tasks in the task set.

        tasksKey = (helper.findPropertyNames(taskSet, 'tasks'))[0];
        tasks = _.result(taskSet, tasksKey);

        _.each(tasks, function(task) {
          result = self.runTask(task, null, taskSetName, taskSet);
          return result;
        });


      } else {
        // Shouldn't continue on.
        result = false;
      }

    } else {
      _err = new Error(u.format("Could not find the taskSet named %s.", taskSetName));

      result = !this.encounteredError(_err, null, null, [taskSetName]);
    }

  } catch (e) {
    result = !this.encounteredError(e, null, "Unexpected error occurred.", [taskSetName]);
  }

  // Done with this task set.

  this.popLogKey();

  this.canContinue = result;

  return result;

}



/**
 * Runs the given task with the given taskConfig.
 */
Slap.prototype.runTask = function(task, taskConfig, taskSetName, taskSet) {
  'use strict';
  var self = this
    , _err
    , errMsg
    , taskName
    , result = true
    , shouldContinue = true
    , callResult
  ;

  if (task) {
    taskConfig = taskConfig || {};


    if (_.isFunction(task)) {
      //
      // Working with a function
      //

      if (taskConfig.name) {
        taskName = taskConfig.name;
        this.pushLogKey(taskName);
      }

      this.emit(helper.events.RUNNING_TASK, this, taskName, task, taskConfig, taskSetName, taskSet);

      // Execution
      try {
        this.emit(helper.events.TASK_EXECUTION_STARTING, this, taskName, task, taskConfig, taskSetName, taskSet);
        callResult = task.call(taskConfig, task, taskConfig, taskSetName, taskSet, this.taskSets);
        this.emit(helper.events.TASK_EXECUTION_FINISHED, this, taskName, task, taskConfig, taskSetName, taskSet, result);

        if (typeof callResult === 'boolean') {
          result = callResult;
        }


      } catch (e) {
        if (!taskName) {
          taskName = task.toString();
        }
        errMsg = u.format("Encountered an error while running task:\n%s", taskName);
        result = !this.encounteredError(e, helper.events.TASK_ERROR, [taskName, task, taskConfig, taskSetName, taskSet]);
        taskName = null;
        shouldContinue = false;
      }

      this.emit(helper.events.RUNNING_TASK_FINISHED, this, taskName, task, taskConfig, taskSetName, taskSet, result);



    } else if (task instanceof Task) {
      //
      // Working with a Task object
      //

      if (task.name) {
        taskName = task.name;
        this.pushLogKey(task.name);
      }

      this.emit(helper.events.RUNNING_TASK, this, task.name, task, taskConfig, taskSetName, taskSet);


      // Pre-execution
      //
      try {
        this.emit(helper.events.TASK_PRE_EXECUTION_STARTING, this, taskName, task, taskConfig, taskSetName, taskSet);
        callResult = task.performPreExecute(taskConfig, taskSetName, taskSet, this.taskSets);
        this.emit(helper.events.TASK_PRE_EXECUTION_FINISHED, this, taskName, task, taskConfig, taskSetName, taskSet, callResult);

        if (typeof callResult === 'boolean') {
          shouldContinue = callResult;
        }

      } catch (e) {
        errMsg = u.format("Encountered an error while running task:\n%s", task.name);
        result = !this.encounteredError(e, helper.events.TASK_ERROR, [task.name, task, taskConfig, taskSetName, taskSet]);
        taskName = null;
        shouldContinue = false;
      }


      if (shouldContinue) {
        // Execution
        //

        try {
          this.emit(helper.events.TASK_EXECUTION_STARTING, this, taskName, task, taskConfig, taskSetName, taskSet);
          callResult = task.performExecute(taskConfig, taskSetName, taskSet, this.taskSets);
          this.emit(helper.events.TASK_EXECUTION_FINISHED, this, taskName, task, taskConfig, taskSetName, taskSet, callResult);

          if (typeof callResult === 'boolean') {
            result = callResult;
            shouldContinue = false;
          }

        } catch (e) {
          errMsg = u.format("Encountered an error while running task:\n%s", task.name);
          result = !this.encounteredError(e, helper.events.TASK_ERROR, [task.name, task, taskConfig, taskSetName, taskSet]);
          taskName = null;
          shouldContinue = false;
        }


      }

      if (task.options.alwaysRunPostExecute || shouldContinue) {
        // Post-execution
        //

        try {
          this.emit(helper.events.TASK_POST_EXECUTION_STARTING, this, taskName, task, taskConfig, taskSetName, taskSet);
          callResult = task.performExecute(taskConfig, taskSetName, taskSet, this.taskSets);
          this.emit(helper.events.TASK_POST_EXECUTION_FINISHED, this, taskName, task, taskConfig, taskSetName, taskSet, callResult);

          if (typeof callResult === 'boolean') {
            result = callResult;
            shouldContinue = false;
          }

        } catch (e) {
          errMsg = u.format("Encountered an error while running task:\n%s", task.name);
          result = !this.encounteredError(e, helper.events.TASK_ERROR, [task.name, task, taskConfig, taskSetName, taskSet]);
          taskName = null;
          shouldContinue = false;
        }


      }

      this.emit(helper.events.RUNNING_TASK_FINISHED, this, task.name, task, taskConfig, taskSetName, taskSet, result);

      if (task.name) {
        this.popLogKey();
      }




    } else if (_.isObject(task)) {
      // Working with an object that may have a `task` property.
      //

      taskConfig = task;
      if (taskConfig.task) {
        task = taskConfig.task;
        results = this.runTask(task, taskConfig, taskSetName, taskSet);
      }
    }


  }

  return result;
}





/**
 * Pushes a `logKeyStack` onto the stack of logKeyStacks.
 *
 * @param {Array} logKeyStack The log key stack.
 *
 * @private
 */
Slap.prototype._pushLogKeyStack = function(logKeyStack) {
  if (logKeyStack) {
    this._logKeyStackStack.push(logKeyStack);
  }
}

/**
 * Pops the top `logKeyStack` from the stack of logKeyStacks.
 *
 * @returns {Array} the popped `logKeyStack` or an empty `logKeyStack` if the
 * stack of logKeyStacks is empty.
 *
 * @private
 */
Slap.prototype._popLogKeyStack = function() {
  return this._logKeyStackStack.pop() || [];
}

/**
 * Pushes the given `logKey` on to the current `logKeyStack`.
 *
 * @param {string} logKey The log key.
 */
Slap.prototype.pushLogKey = function(logKey) {
  if (logKey) {
    return this._logKeyStack.push(logKey);
  }
}

/**
 * Pops the top `logKey` from the current `logKeyStack`.
 *
 * @returns {string} the popped `logKey` or `undefined` if the current `logKeyStack` is empty.
 */
Slap.prototype.popLogKey = function() {
  return this._logKeyStack.pop();
}

/**
 * Returns the current `logKeyStack`.
 */
Slap.prototype.logKeyStack = Slap.prototype.logKey = function() {
  return this._logKeyStack;
}

Slap.prototype.encounteredError(err, eventKey, extraErrMsg, errArgs) {
  var result = false;

  if (err) {
    eventKey = eventKey || helper.events.ERROR;
    errArgs = errArgs || [];

    this.canContinue = false;
    this.lastErr = err;
    this.lastExtraErrMsg = extraErrMsg;

    this.exitCode = helper.exitCode.ERROR;

    if (err.exitCode) {
      this.exitCode = err.exitCode;
    } else {
      if (helper.exitCode[eventKey]) {
        this.exitCode = helper.exitCode[eventKey];
      }
    }


    this.emit(eventKey, this, err, extraErrMsg, errArgs);

    result = true;

    if (this.onFinishedCallback && _.isFunction(this.onFinishedCallback)) {
      this.onFinishedCallback(err, extraErrMsg, this.exitCode);
    }
  }

  return result;
}


/**
 * Creates a simple task.
 */
Slap.prototype.simpleTask = function(taskName, execute, options, description, preExecute, postExecute) {
  return new Task(taskName, null, preExecute, execute, postExecute, options);
}

Slap.prototype.descriptiveTask = function(taskName, taskDescription, execute, options, preExecute, postExecute) {
  return new Task(taskName, taskDescription, preExecute, execute, postExecute, options);
}

Slap.prototype.createTask = function(taskName, taskDescription, preExecute, execute, postExecute, options) {
  return new Task(taskName, taskDescription, preExecute, execute, postExecute, options);
}


/**
 * Echos the provided output.
 */
Slap.prototype.echo = function(msg) {
  if (msg) {
    this.emit(helper.events.ECHO, this, u.format.apply(this, arguments), 0);
  }
}

