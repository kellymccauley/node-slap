'use strict';
var u = require('util')
  , EventEmitter = require('events').EventEmitter
  , _ = require('lodash')
  , debug = require('debug')('slap:Task')

  , helper = require('./helper')
  , STATE_NOT_RUNNING = 'task:not-running'
  , STATE_RUNNING = 'task:running'
;

function Task(taskName, taskDescription, preExecute, execute, postExecute, options) {
  'use strict';
  options = options || {};

  this.options = _.assign(
    {
      alwaysRunPostExecute: false
    },
    options
  );
  this.name = taskName || throw new Error("Unable to create a task.  A task name was not provided.  When creating a new task, `taskName` must be a string");

  this.description = taskDescription;

  this.state = {
    currentState: STATE_NOT_RUNNING,
    preExecute: {},
    execute: {},
    postExecute: {}
  };

  this.preExecute = preExecute;
  if (this.preExecute && typeof this.preExecute !== 'function') {
    throw new Error(u.format("Unable to create a task named %s.  When creating a new task and passing in a value to `preExecute`, the value passed must be a Function."), this.name);
  }

  this.execute = execute || function(taskSetName, taskConfig, taskSets, slapConfig, executionCallback) {};
  if (this.execute && typeof this.execute !== 'function') {
    throw new Error(u.format("Unable to create a task named %s.  When creating a new task and passing in a value to `execute`, the value passed must be a Function."), this.name);
  }

  this.postExecute = postExecute;
  if (this.postExecute && typeof this.postExecute !== 'function') {
    throw new Error(u.format("Unable to create a task named %s.  When creating a new task and passing in a value to `postExecute`, the value passed must be a Function."), this.name);
  }

}

u.inherits(Task, EventEmitter);

/**
 * Calls the pre-execute function: `this.preExecute`.  If the pre-execute function
 * returns `false`, then the task's execution and post-execution functions are skipped
 * and any subsequent tasks are executed.
 *
 * @param {Object} taskConfig The task's configuration.
 * @param {string} taskSetName The name of the task set under which this task is running.
 * @param {Object} taskSet The task set under which this task is running.
 * @param {Object} taskSets All task sets loaded.
 *
 * @returns {boolean|null|undefined} `true`, `null`, or `undefined` if execution of this task should
 * continue or `false` if this task should be skipped.
 */
Task.prototype.performPreExecute = function(taskConfig, taskSetName, taskSet, taskSets) {
  'use strict';
  var _err
    , errMsg
    , result = true
    , callResult
  ;


  if (this.preExecute && typeof this.preExecute === 'function') {
    try {
      this.currentState = STATE_RUNNING;
      this.state.preExecute.startedAt = new Date();

      // Perform the pre-execution
      callResult = this.preExecute.call(taskConfig, this, taskConfig, taskSetName, taskSet, taskSets);

      this.state.currentState = STATE_NOT_RUNNING;

      if (typeof callResult === 'boolean') {
        result = callResult;
      }

      this.state.preExecute.finishedAt = new Date();

    } catch (e) {
      this.state.currentState = STATE_NOT_RUNNING;
      this.state.preExecute.failedAt = new Date();
      throw e;
    }
  }

  return result;
}


/**
 * Calls the execute function: `this.execute`.  If the execute function returns
 * `false`, then the task's post-execution function is skipped, unless
 * this.options.alwaysRunPostExecute is `true`, and the execution of all
 * subsequent tasks will be halted.
 *
 * @param {Object} taskConfig The task's configuration.
 * @param {string} taskSetName The name of the task set under which this task is running.
 * @param {Object} taskSet The task set under which this task is running.
 * @param {Object} taskSets All task sets loaded.
 *
 * @returns {boolean|null|undefined} `true`, `null`, or `undefined` if
 * execution of this task and subsequent tasks should continue or `false` if
 * the execution of all subsequent tasks should be halted.
 */
Task.prototype.performExecute = function(taskConfig, taskSetName, taskSet, taskSets) {
  'use strict';
  var _err
    , errMsg
    , result = true
    , callResult
  ;


  if (this.execute && typeof this.execute === 'function') {
    try {
      this.currentState = STATE_RUNNING;
      this.state.execute.startedAt = new Date();

      // Perform the pre-execution
      callResult = this.execute.call(taskConfig, this, taskConfig, taskSetName, taskSet, taskSets);

      this.state.currentState = STATE_NOT_RUNNING;

      if (typeof callResult === 'boolean') {
        result = callResult;
      }

      this.state.execute.finishedAt = new Date();

    } catch (e) {
      this.state.currentState = STATE_NOT_RUNNING;
      this.state.execute.failedAt = new Date();
      throw e;
    }
  }

  return result;
}


/**
 * Calls the post-execute function: `this.postExecute`.  If the post-execute
 * function returns `false`, then the execution of all subsequent tasks will be
 * halted.
 *
 * @param {Object} taskConfig The task's configuration.
 * @param {string} taskSetName The name of the task set under which this task is running.
 * @param {Object} taskSet The task set under which this task is running.
 * @param {Object} taskSets All task sets loaded.
 *
 * @returns {boolean|null|undefined} `true`, `null`, or `undefined` if
 * execution subsequent tasks should continue or `false` if the execution of
 * all subsequent tasks should be halted.
 */
Task.prototype.performPostExecute = function(taskConfig, taskSetName, taskSet, taskSets) {
  'use strict';
  var _err
    , errMsg
    , result = true
    , callResult
  ;


  if (this.execute && typeof this.execute === 'function') {
    try {
      this.currentState = STATE_RUNNING;
      this.state.postExecute.startedAt = new Date();

      // Perform the pre-execution
      callResult = this.postExecute.call(taskConfig, this, taskConfig, taskSetName, taskSet, taskSets);

      this.state.currentState = STATE_NOT_RUNNING;

      if (typeof callResult === 'boolean') {
        result = callResult;
      }

      this.state.postExecute.finishedAt = new Date();

    } catch (e) {
      this.state.currentState = STATE_NOT_RUNNING;
      this.state.postExecute.failedAt = new Date();
      throw e;
    }
  }

  return result;
}




// Task.prototype.performExecute = function(taskConfig, taskSetName, taskSet, taskSets) {
//   'use strict';
// }
// 
// Task.prototype.performPostExecute = function(taskConfig, taskSetName, taskSet, taskSets) {
//   'use strict';
// }


exports.Task = Task;

