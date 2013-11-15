'use strict';
var path = require('path')
  , u = require('util')
  , _ = require('lodash')
  , debug = require('debug')('slap:FileSet')
  , helper = require('./helper')
  ;

function FileSet(candidateFiles, filter, filterThisArg) {
  'use strict';
  this._isExpanded = false;
  this._files = [];

  if (_.isUndefined(candidateFiles) || _.isNull(candidateFiles)) {
    throw new Error("Unable to create a new FileSet. The 'candidateFiles' argument is required when creating a FileSet.");
  }

  if (_.isString(candidateFiles)) {
    this.candidateFiles = [candidateFiles];

  } else if (_.isArray(candidateFiles)) {
    this.candidateFiles = _.flatten(candidateFiles);

  } else {
    throw new Error("Unable to create a new FileSet. Unsupported 'candidateFiles' argument type: " + typeof candidateFiles);
  }

  this.filterCallback = _.createCallback(filter, filterThisArg) || null;
}

Object.defineProperty(FileSet.prototype, 'files', {
  enumerable: true,
  get: function() {
    'use strict';
    if (!this._isExpanded) {
      this._expandFiles();
    }
    return this._files;
  }
});

FileSet.prototype._expandFiles = function() {
  'use strict';
  var files = []
    , filterCallback = this.filterCallback;


  if (this.candidateFiles.length > 0) {
    _.each(this.candidateFiles, function(candidateFile) {
      'use strict';
      var found = [];

      if (candidateFile) {
        found = helper.expandGlob(candidateFile);

        if (filterCallback) {
          _.each(found, function(f) {
            'use strict';
             if (filterCallback(f)) {
               files.push(f);
             }
          });

        } else {
          files.push(found);

        }
      }

    });
  }

  this._files = _.flatten(files);
  this._isExpanded = true;
}


exports.FileSet = FileSet;

exports.of = function(candidateFiles, filter, filterThisArg) {
  'use strict';
  return new FileSet(candidateFiles, filter, filterThisArg);
}
