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
  , _ = require('lodash')
  , fs = require('fs')
  , glob = require('glob')
  , resolve = require('resolve').sync
  , linewrap = require('linewrap')
  , clc = require('cli-color')
  , Table = require('cli-table')

  , dbg = require('debug')
  , d_eg = dbg('slap:helper:expandGlob')
  , d_tso = dbg('slap:helper:timeStampOf')

  , helper
  , events
  , exitCode
  , timeStampOf
  , expandGlob
  , resolveModule
  , printTaskSets
  , findPropertyNames
  , reportLevel

  , trues =  ['true',  'y', 'yes', 'on',  'enabled',  'active',   'allow',    'approve', 'permit']
  , falses = ['false', 'n', 'no',  'off', 'disabled', 'inactive', 'disallow', 'deny',    'forbid']
  , toBool

  ;

helper = module.exports = {};

// Event keys.
events = helper.events = {
  ERROR: 'error'
  , RESOLVING_TASK_SETS_FILE: 'resolving_task_sets_file'
  , RESOLVING_TASK_SETS_FILE_FINISHED: 'resolving_task_sets_file_finished'

  , LOADING_TASK_SETS_FILE: 'loading_task_sets_file'
  , LOADING_TASK_SETS_FILE_FINISHED: 'loading_task_sets_file_finished'

  , RUNNING_DEPENDENT_TASK_SETS: 'running_dependent_task_sets'
  , RUNNING_DEPENDENT_TASK_SETS_FINISHED: 'running_dependent_task_sets_finished'

  , RUNNING_TASK: 'running_task'
  , RUNNING_TASK_FINISHED: 'running_task_finished'

  , TASK_PRE_EXECUTION_STARTING: 'task_pre_execution_starting'
  , TASK_PRE_EXECUTION_FINISHED: 'task_pre_execution_finished'

  , TASK_EXECUTION_STARTING: 'task_execution_starting'
  , TASK_EXECUTION_FINISHED: 'task_execution_finished'

  , TASK_POST_EXECUTION_STARTING: 'task_post_execution_starting'
  , TASK_POST_EXECUTION_FINISHED: 'task_post_execution_finished'

  , TASK_ERROR: 'task_error'

  , ECHO: 'echo'
};

// Process exit codes.
exitCode = helper.exitCode = {
  FILE_NOT_FOUND: 1,
  TASK_SET_NOT_FOUND: 5,
  ERROR: 255
}

// Report levels (AKA log levels)
reportLevel = helper.rptLvl = helper.reportLevel = {
  'silent':   0, 
  'error':    1, 
  'warning':  2, 
  'notice':   3, 
  'info':     4, 
  'debug':    5, 
  'trace':    6, 
  'internal': 7,
  'internal0': 7,
  'internal1': 8,
  'internal2': 9,
  'internal3': 10,
  'internal4': 11,
  'internal5': 12,
  'internal6': 13,
  'internal7': 14,
  'internal8': 15,
  'internal9': 16,

  0: 'silent', 
  1: 'error', 
  2: 'warning', 
  3: 'notice', 
  4: 'info', 
  5: 'debug', 
  6: 'trace', 
  7: 'internal',
  8: 'internal1',
  9: 'internal2',
  10: 'internal3',
  11: 'internal4',
  12: 'internal5',
  13: 'internal6',
  14: 'internal7',
  15: 'internal8',
  16: 'internal9',

}


/**
 * Finds the given property name within the given object.
 *
 * ```
 *  names = findPropertyNames(obj, propertyName);
 *  names = findPropertyNames(obj, function(val, key, obj) {...});
 * ```
 */
findPropertyNames = helper.findPropertyNames = function(obj, propertyName) {
  'use strict';
  var results = []
    , callback;

  if (_.isString(propertyName)) {
    callback = function(val, key, obj) {
      return (propertyName === key);
    };

  } else if (_.isRegExp(propertyName)) {
    callback = function(val, key, obj) {
      return (propertyName.test(key));
    };

  } else if (_.isFunction(propertyName)) {
    callback = propertyName;

  }

  if (callback) {
    _.forIn(obj, function(value, key, obj) {
      if (callback(value, key, obj)) {
        results.push(key);
      }
    });
  }

  return results;
}



/**
 * Tries to resolve the given module name within the give search paths.
 */
resolveModule = helper.resolveModule = function(moduleName, searchPaths) {
  'use strict';
  var result
    , nmModulePath
  ;
  
  if (!moduleName) {
    throw new Error('A module name is required when calling helper.resolveModule(moduleName, searchPaths).');
  }

  nmModulePath = path.join('node_modules', moduleName);

  searchPaths = searchPaths || [process.cwd(), __dirname];
  if (_.isString(searchPaths)) {
    searchPaths = [searchPaths];
  }

  searchPaths.forEach(function(p) {
    var np = p;
    // A bit of recursive loop unrolling.
    try {
      result = resolve(moduleName, {basedir: np});
      if (result) return false;
    } catch (e1) {
      try {
        np = path.join(p, '..');
        result = resolve(moduleName, {basedir: np});
        if (result) return false;
      } catch (e2) {
        try {
          np = path.join(p, '..', '..');
          result = resolve(moduleName, {basedir: np});
          if (result) return false;
        } catch (e3) {
          try {
            np = path.join(p, '..', 'node_modules');
            result = resolve(moduleName, {basedir: np});
            if (result) return false;
          } catch (e4) {
          }
        }
      }
    }
    
    return true;
  });

  return result;


}



/**
 * Gets the time stamp of the given file.
 */
timeStampOf = helper.timeStampOf = function(file, callback) {
  'use strict';
  var debug = d_tso, stats, ts, _err, cb;

  // debug("Stat-ing %s ...", file);
  
  try {
    stats = fs.statSync(file);
    ts = stats.ctime.getTime();
  } catch (e) {
    _err = e;
  }

  // debug("_err:  %s", u.inspect(_err));
  // debug("stats: %s", u.inspect(stats));
  // debug("ts:    %s", u.inspect(ts));
  
  if (callback && _.isFunction(callback)) {
    // debug("Executing callback function.");
    cb = _.createCallback(callback, stats);
    cb(_err, ts, stats);

  } else if (_err) {
    throw _err;

  }

  return ts;
}


/**
 * Expands the given glob expression into a list of files.
 *
 * @param {string} globExpr   The glob expression.
 * @param {Object} [options]  The options.
 * @param {Object} [options.globOptions]  The options to pass to the
 * [glob](https://npmjs.org/package/glob) module.
 *
 * @returns {Array.<string>} The list of files.
 */
expandGlob = helper.expandGlob = function(globExpr, options) {
  'use strict';
  var debug = d_eg
    , globOpts = {strict: true, nosort: true}
    , out = []
    ;

  options = options || {};

  if (options.globOptions) {
    globOpts = _.extend(globOpts, options.globOptions);
  }

  debug("options : %s", u.inspect(options));
  debug("globOpts: %s", u.inspect(globOpts));
  out = glob.sync(globExpr, globOpts);

  return out;
}



/**
 * Prints out the list of task sets with descriptions.
 */
printTaskSets = helper.printTaskSets = function(config, taskSets, showAll) {
  'use strict';
  var
      taskSetKeys
    , tsTable
    , fullList = []
    , wrap;


  wrap = linewrap(79, {
    skipScheme: 'ansi-color',
    respectLineBreaks: 'all',
    whitespace: 'all'
  });

  tsTable = new Table({
    head: [clc.underline("Task Set Name"), clc.underline("Description")],
    chars: {
      'top-left': '',     'top': '',        'top-mid': '',    'top-right': '',
      // 'mid': '-',         'mid-mid': '  ',
      'mid': ' ',         'mid-mid': '  ',
      'left': ' ',        'left-mid': ' ',  'right': '  ',    'right-mid': '  ',
      'bottom-left': '',  'bottom': '',     'bottom-mid': '', 'bottom-right': ''
    },
    style: { compact: true }
  });

  fullList.push(clc.bold('Task Sets ...'));

  taskSetKeys = _.keys(taskSets);
  taskSetKeys.sort();

  _.each(taskSetKeys, function(tsName) {
    'use strict';
    var ts
      , desc
      , dependsOn
      , prunedDesc
      , row
      , descKey;

    ts = taskSets[tsName];
    descKey = _.findKey(taskSet, function(val, key) {
      return (_.startsWith(key, 'desc'));
    });

    if (showAll || ts.description) {
      row = [tsName, ''];

      fullList.push('');
      fullList.push('');

          fullList.push('Name:          ' + clc.bold(tsName));

      if (ts.deps) {
        dependsOn = _.toSentenceSerial(ts.deps);
          fullList.push('Depends On:    ' + dependsOn);
      }

      if (ts.description) {
        desc = ts.description;
        if (desc.length > 79) {
          fullList.push('Description:');
          fullList.push('');
          fullList.push(wrap(desc));
        } else {
          fullList.push('Description:   ' + desc);
        }

        prunedDesc = desc;
        prunedDesc = _.prune(prunedDesc, 45, '...');
        row[1] = prunedDesc;
      }


      tsTable.push(row);
    }
  });

  console.log(_.flatten(fullList).join("\n"));
  console.log();
  console.log();
  console.log(clc.bold('Summary ...'));
  console.log(tsTable.toString());
  process.exit(0);

}


toBool = helper.toBool = helper.toBoolean = function(val, thisArg) {
  'use strict';
  var out, tmp;

  switch (typeof val) {
    case 'boolean':
      out = val;
      break;

    case 'function':
      if (thisArg) out = toBoolean(val.call(thisArg));
      break;

    case 'string':
      tmp = val.trim().toLowerCase();
      if (_.contains(trues, tmp)) {
        out = true;
      } else if (_.contains(falses, tmp)) {
        out = false;
      }

      break;
  } 

  return out;
}

