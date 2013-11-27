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
var BaseReporter = require('./base')
  , u = require('util')
  , _ = require('lodash')
  , clc = require('cli-color')
  , debug = require('debug')('slap:reporter:console-log')
  , helper = require('./helper')
;

function ConsoleLog(slapObj)  {
  'use strict';
  var self = this;
  BaseReporter.call(this, slapObj);
  
  this.supportsColors = (Boolean(process.stdout.isTTY) && Boolean(process.stderr.isTTY));
  this.useColors = (this.slap.config.useColors && this.supportsColors);

  this.colors = {
  };

  if (this.useColors) {
    _.forOwn(this.config.colors, function(attrs, key) {
      // FIXME Implement with real colors.
      self.colors[key] = nocolor;
    });

  } else {
    _.forOwn(this.slap.config.colors, function(attrs, key) {
      self.colors[key] = nocolor;
    });
  }

  this.logKeyLBracket = this.colors.logKeyLBracket('[');
  this.logKeySep = this.colors.logKeySep(':');
  this.logKeyRBracket = this.colors.logKeyRBracket(']');

  function nocolor(text) {
    return text;
  }


  // RESOLVING_TASK_SETS_FILE
  this.slap.on(helper.events.RESOLVING_TASK_SETS_FILE, function(slap, taskSetsFile) {
    'use strict';
    var lk, msg;

    if (self.reportLevel >= helper.reportLevel['trace']) {
      // log the output
      lk = self.colorizeLogKey(slap.logKey());
      msg = self.colors.trace('Resolving task sets file: ' + taskSetsFile);
      console.log("%s %s", lk, msg);
    }
  });

  // RESOLVING_TASK_SETS_FILE_FINISHED
  this.slap.on(helper.events.RESOLVING_TASK_SETS_FILE_FINISHED, function(slap, taskSetsFile) {
    'use strict';
    var lk, msg;

    if (self.reportLevel >= helper.reportLevel['trace']) {
      // log the output
      lk = self.colorizeLogKey(slap.logKey());
      msg = self.colors.trace('Finished resolving task sets file: ' + taskSetsFile);
      console.log("%s %s", lk, msg);
    }
  });


  // LOADING_TASK_SETS_FILE
  this.slap.on(helper.events.LOADING_TASK_SETS_FILE, function(slap, taskSetsFile) {
    'use strict';
    var lk, msg;

    if (self.reportLevel >= helper.reportLevel['info']) {
      // log the output
      lk = self.colorizeLogKey(slap.logKey());
      msg = self.colors.info('Loading task sets file: ' + taskSetsFile);
      console.log("%s %s", lk, msg);
    }
  });

  // LOADING_TASK_SETS_FILE_FINISHED
  this.slap.on(helper.events.LOADING_TASK_SETS_FILE_FINISHED, function(slap, taskSetsFile) {
    'use strict';
    var lk, msg;

    if (self.reportLevel >= helper.reportLevel['trace']) {
      // log the output
      lk = self.colorizeLogKey(slap.logKey());
      msg = self.colors.trace('Finished loading task sets file: ' + taskSetsFile);
      console.log("%s %s", lk, msg);
    }
  });


  // RUNNING_DEPENDENT_TASK_SETS
  this.slap.on(helper.events.RUNNING_DEPENDENT_TASK_SETS, function(slap, taskSetName, taskSet) {
    'use strict';
    var lk, msg, tsn;

    if (self.reportLevel >= helper.reportLevel['info']) {
      // log the output
      lk = self.colorizeLogKey(slap.logKey());
      tsn = self.colorizeTaskSetName(taskSetName);
      if (_.isBlank(tsn)) {
        tsn += "'s";
      }

      msg = self.colors.info('Running' + tsn + ' dependant task sets.');
      console.log("%s %s", lk, msg);
    }
  });

  // RUNNING_DEPENDENT_TASK_SETS_FINISHED
  this.slap.on(helper.events.RUNNING_DEPENDENT_TASK_SETS_FINISHED, function(slap, taskSetName, taskSet) {
    'use strict';
    var lk, msg, tsn;

    if (self.reportLevel >= helper.reportLevel['trace']) {
      // log the output
      lk = self.colorizeLogKey(slap.logKey());
      tsn = self.colorizeTaskSetName(taskSetName);
      if (_.isBlank(tsn)) {
        tsn += "'s";
      }
      msg = self.colors.trace('Finished running' + tsn + ' dependent task sets.');
      console.log("%s %s", lk, msg);
    }
  });

  // RUNNING_TASK
  this.slap.on(
    helper.events.RUNNING_TASK, 
    function(slap, taskName, task, taskConfig, taskSetName, taskSet) {
      'use strict';
      var lk, msg, tn, tsn;

      if (self.reportLevel >= helper.reportLevel['info']) {
        // log the output
        lk = self.colorizeLogKey(slap.logKey());
        tsn = self.colorizeTaskSetName(taskSetName);
        tn = self.colorizeTaskName(taskName);
        msg = self.colors.info('Running ' + [tsn, tn].join('.') + '.');
        console.log("%s %s", lk, msg);
      }
    }
  );

  // RUNNING_TASK_FINISHED
  this.slap.on(
    helper.events.RUNNING_TASK_FINISHED,
    function(slap, taskName, task, taskConfig, taskSetName, taskSet, result) {
      'use strict';
      var lk, msg, tn, tsn;

      if (self.reportLevel >= helper.reportLevel['info']) {
        // log the output
        lk = self.colorizeLogKey(slap.logKey());
        tsn = self.colorizeTaskSetName(taskSetName);
        tn = self.colorizeTaskName(taskName);

        if (self.reportLevel >= helper.reportLevel['debug']) {
          msg = self.colors.info('Finished running ' + [tsn, tn].join('.') + '.');
          console.log("%s %s", lk, msg);

        } else if (typeof result === 'boolean' && !result) {
          msg = self.colors.info('Halting further task execution.');
          console.log("%s %s", lk, msg);

        }
      }
    }
  );

  // TASK_PRE_EXECUTION_STARTING
  this.slap.on(
    helper.events.TASK_PRE_EXECUTION_STARTING, 
    function(slap, taskName, task, taskConfig, taskSetName, taskSet) {
      'use strict';
      var lk, msg, tn, tsn;

      if (self.reportLevel >= helper.reportLevel['debug']) {
        // log the output
        lk = self.colorizeLogKey(slap.logKey());
        tsn = self.colorizeTaskSetName(taskSetName);
        tn = self.colorizeTaskName(taskName);
        msg = self.colors.info('Performing pre-execution of ' + [tsn, tn].join('.') + '.');
        console.log("%s %s", lk, msg);
      }
    }
  );

  // TASK_PRE_EXECUTION_FINISHED
  this.slap.on(
    helper.events.TASK_PRE_EXECUTION_FINISHED,
    function(slap, taskName, task, taskConfig, taskSetName, taskSet) {
      'use strict';
      var lk, msg, tn, tsn;

      if (self.reportLevel >= helper.reportLevel['info']) {
        // log the output
        lk = self.colorizeLogKey(slap.logKey());
        tsn = self.colorizeTaskSetName(taskSetName);
        tn = self.colorizeTaskName(taskName);
        msg = self.colors.info('Finished running ' + [tsn, tn].join('.') + '.');
        console.log("%s %s", lk, msg);
      }
    }
  );




}

u.inherits(ConsoleLog, BaseReporter);

ConsoleLog.prototype.colorizeTaskSetName = function(taskSetName) {
  'use strict';
  var tsn = '';
  if (taskSetName) {
    tsn = _.trim(taskSetName);
    if (!_.isBlank(tsn)) {
      tsn = self.colors.taskSetName(tsn);
    }
  }
  return tsn;
}

ConsoleLog.prototype.colorizeTaskName = function(taskName) {
  'use strict';
  var tn = '';
  if (taskName) {
    tn = _.trim(taskName);
    if (!_.isBlank(tn)) {
      tn = self.colors.taskName(tn);
    }
  }
  return tn;
}

ConsoleLog.prototype.colorizeLogKey = function(logKey) {
  'use strict';
  var lk, parts = [];

  parts.push(this.logKeyLBracket);

  if ((logKey && logKey.length === 0) || !logKey) {
    parts.push(this.colors.logKey1('slap'));
  }

  if (logKey) {
    if (logKey.length >= 1) {
      parts.push(this.colors.logKey1(logKey[0]));

      if (logKey.length >= 2) {
        parts.push(this.colors.logKey2(logKey[1]));

        if (logKey.length >= 3) {
          logKey.slice(2).forEach(function(v) {
            parts.push(this.colors.logKeyRest(v));
          });

        }

      }

    }

  }


  parts.push(this.logKeyRBracket);
  lk = parts.join(this.logKeySep);
  return lk;
}


