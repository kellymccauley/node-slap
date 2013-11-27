'use strict';
var path = require('path')
  , u = require('util')
  , fileset = require('./build_lib/fileset')
  , context
;

context = taskSets.context;

taskSets.foo = {
  description: 'The foo task set.',
  tasks: [
    simpleTask('fooTask', function(task, taskConfig, taskSetName, taskSet, taskSets) {
      // `this` should be taskConfig
      // `task` should be the `fooTask` Task object.
      // `taskConfig` should be an empty plain object.
      // `taskSetName` should be `foo`.
      // `taskSet` should be the foo task set.
      // `taskSets` should be task sets in which the foo task set is defined.
    }),

    {
      task: simpleTask('aTaskName', function(task, taskConfig, taskSetName, taskSet, taskSets) {
        // `this` should be taskConfig
        // `task` should be a Task object.
        // `taskConfig` should be the object containing the `aTaskName` Task object.
        // `taskSetName` should be `foo`.
        // `taskSet` should be the foo task set.
        // `taskSets` should be task sets in which the foo task set is defined.

        echo("Setting `isForWebSite` property to `true`");
        context.setProperty('isForWebSite', true);
      }),
      a: 1,
      b: 2
    },

    {
      name: 'plain object task',
      description: 'Does stuff',
      task: function(task, taskConfig, taskSetName, taskSet, taskSets) {
        // `this` should be taskConfig
        // `task` should be a Task object.
        // `taskConfig` should be the object containing this task function.
        // `taskSetName` should be `foo`.
        // `taskSet` should be the foo task set.
        // `taskSets` should be task sets in which the foo task set is defined.
      },
    },

    {
      description: 'Copy tmp/x/y.txt to tmp/z.txt',
      task: copy,
      from: 'tmp/x/y.txt',
      toFile: 'tmp/z.txt'
    },

    createTask(
      // task name
      'barTask', 

      // task description
      'The barTask description',

      // pre-execution
      function(task, taskConfig, taskSetName, taskSet, taskSets) {
        return true;
      },

      // execution
      function(task, taskConfig, taskSetName, taskSet, taskSets) {
        return true;
      },

      // post-execution
      function(task, taskConfig, taskSetName, taskSet, taskSets) {
        return true;
      },

      // Options
      {
        alwaysRunPostExecute: true
      }
    )

  ]
}

module.exports = taskSets;

