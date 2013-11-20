'use strict';
var path = require('path')
  , u = require('util')
  , fs = require('fs')
  , shell = require('shelljs')
  , _ = require('lodash')
  , glob = require('glob')
  , clc = require('cli-color')
  , debug = require('debug')('slap:task:copy')

  , helper = require('../helper')
  , fileset = require('../fileset')
  , FileSet = fileset.FileSet
  ;

shell.config.fatal = true;
shell.config.silent = true;

module.exports = function(taskSetName, taskConfig, taskSets, slapConfig, callback) {
  'use strict';
  var logKey
    , errMsg
    , _err
    , destPath
    , destStats
    , destLastTS
    , isDestFile
    , destParentPath
    , srcFileSet
    , srcFiles
    ;

  logKey = [
    clc.bold('['), 
    clc.bold.green(taskSetName), 
    clc.bold(':'),
    clc.bold.yellow('copy'),
    clc.bold(']')].join('');

  debug("%s Executing copy task ...", logKey);


  if (taskConfig.toDir || taskConfig.toFile) {

    if (taskConfig.toFile) {
      // Destination is a file.
      destPath = taskConfig.toFile;
      destParentPath = path.dirname(destPath);
      isDestFile = true;
    }

    if (taskConfig.toDir) {
      // Destination is a directory.
      destPath = taskConfig.toDir;
      isDestFile = false;
    }

    if (taskConfig.from) {

      srcFileSet = (taskConfig.from instanceof FileSet) ? 
        taskConfig.from : 
        fileset.of(taskConfig.from);

      srcFiles = srcFileSet.files;

      if (isDestFile) {
        // Print out a warning if 'destPath' is a file and 'from' has more than one file.

        if (srcFiles.length > 1) {
          errMsg = u.format("%s Misconfiguration?  The copy task does not concatinate files.  %s files would each be copied to the file: %s.", logKey, srcFiles.length, destPath);
          console.log(errMsg);
          _err = new Error(errMsg);

        }

      }

      if (!_err) {
        // No errors so far.

        try {
          if (isDestFile) {
            // Create the destination's parent directory
            if (!fs.existsSync(destParentPath)) {
              u.print(u.format("%s Creating %s ...", logKey, destParentPath));
              shell.mkdir('-p', destParentPath);
              u.print(" ok\n");
            }
            
          } else {
            // Create the destination's directory
            if (!fs.existsSync(destPath)) {
              u.print(u.format("%s Creating %s ...", logKey, destPath));
              shell.mkdir('-p', destPath);
              u.print(" ok\n");
            }

          }

          if (fs.existsSync(destPath)) {
            helper.timeStampOf(destPath, function(err, ts, stats) {
              if (err) throw err;

              destLastTS = ts;
              destStats = stats;
            })
          }

        } catch (e) {
          _err = e;
          console.log("%s %s", logKey, _err.message);
        }

        if (!_err) {
          // Ready to do the copying.

          // debug("%s destPath:       %s", logKey, u.inspect(destPath));
          // debug("%s destStats:      %s", logKey, u.inspect(destStats));
          // debug("%s destLastTS:     %s", logKey, u.inspect(destLastTS));
          // debug("%s isDestFile:     %s", logKey, u.inspect(isDestFile));
          // debug("%s destParentPath: %s", logKey, u.inspect(destParentPath));
          // debug("%s srcFileSet:     %s", logKey, u.inspect(srcFileSet));
          // debug("%s srcFiles:       %s", logKey, u.inspect(srcFiles));

          _.each(srcFiles, function(sf) {
            'use strict';
            var sfStats, sfLastTS;

            // debug("%s sf: %s", logKey, sf);

            if (fs.existsSync(sf)) {
              try {
                helper.timeStampOf(sf, function(err, ts, stats) {
                  if (err) throw err;
                  sfLastTS = ts;
                  sfStats = stats;
                });


                if (sfStats.isFile()) {
                  // sf is a file.

                  // Copy sf to dest.
                  u.print(u.format("%s Copying %s to %s ...", logKey, sf, destPath));
                  try {
                    shell.cp('-f', sf, destPath);

                  } catch (e) {
                    u.print(" not ok!\n");
                    _err = e;
                    console.log("%s %s", logKey, e.message);
                    return false;
                  }

                  u.print(" ok\n");


                } else if (sfStats.isDirectory()) {
                  // sf is a directory and dest should also be a directory
                  u.print(u.format("%s Copying %s to %s ...", logKey, sf, destPath));
                  try {
                    shell.cp('-rf', sf, destPath);

                  } catch (e) {
                    u.print(" not ok!\n");
                    _err = e;
                    console.log("%s %s", logKey, e.message);
                    return false;
                  }

                  u.print(" ok\n");

  

                  // Recursively copy all of the contents of sf to dest.
                }

              } catch (e) {
                // u.print(" not ok!\n");
                _err = e;
                console.log("%s Error occurred while copying %s to %s", logKey, sf, destPath);
                console.log("%s %s", logKey, _err.message);
                return false;
              }


            } else {
              console.log("%s WARNING: Cannot copy file to %s. 'from' file not found: %s", logKey, destPath, sf);
            }
          });
        }

      }

    } else {
      // from: was not specified in the task configuration.
      errMsg = u.format("%s 'from' property is required for the copy task and it was not found in the task configuration: %s", logKey, u.inspect(taskConfig));
      console.log(errMsg);
      _err = new Error(errMsg);
    }

  } else {
    // to: was not specified in the task configuration.
    errMsg = u.format("%s either a 'toDir' or 'toFile' property is required. Neither 'toDir' or 'toFile' were found in the task configuration: %s", logKey, u.inspect(taskConfig));
    console.log(errMsg);
    _err = new Error(errMsg);
  }



  callback(_err);

};



