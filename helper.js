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
  , timeStampOf
  , expandGlob
  , resolveModule
  , printTaskSets
  ;

helper = module.exports = {};

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
      , row;

    ts = taskSets[tsName];

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



