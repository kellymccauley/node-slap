'use strict';
var path = require('path')
  , u = require('util')
  , shell = require('shelljs')
  , _ = require('lodash')
  , clc = require('cli-color')
  , debug = require('debug')('slap:task:rm')
  , helper = require('../helper')
  ;

shell.config.fatal = true;
shell.config.silent = true;

module.exports = function(taskSetName, taskConfig, taskSets, slapConfig, callback) {
  'use strict';
  var logKey
    , toDelete = []
    , errMsg
    , _err
    , root = path.resolve('/')
    ;
 
  logKey = [
    clc.bold('['), 
    clc.bold.green(taskSetName), 
    clc.bold(':'),
    clc.bold.red('rm'),
    clc.bold(']')].join('');

  debug("%s Executing remove task ...", logKey);

  _.each(taskConfig.files, function(file) {
    'use strict';
    toDelete.push(helper.expandGlob(file));
  });

  toDelete = _.flatten(toDelete);
  debug("%s toDelete: %s", logKey, u.inspect(toDelete));

  _.each(toDelete, function(file) {
    'use strict';
    if (file !== root) {
      u.print(u.format("%s Removing %s ...", logKey, file));
      try {
        shell.rm('-rf', file);

      } catch (e) {
        u.print(" not ok!\n");
        _err = e;
        console.log("%s %s", logKey, _err.message);
        return false;

      }

      u.print(" ok\n");
    }
  });

  callback(_err);
};
