'use strict';
var path = require('path')
  , u = require('util')
  , _ = require('lodash')
  , dbg = require('debug')
  , d_rp = dbg('slap:context:resolveProperty')
  , d_setp = dbg('slap:context:setProperty')
  , d_rmp = dbg('slap:context:removeProperty')
  , d__rp = dbg('slap:context:_resolveProp')
  , d__dacp = dbg('slap:context:_descendAndCreateProp')

  , context
  , _runProperties = {}
  , bindTo
  , loadWith
  , removeProperty
  , reset
  , resolveProperty
  , runProperties
  , setProperty

  , OBJ_SEP_RE = /\.+/
  ;


context = module.exports = {};

/**
 * Binds this context to the given object.
 *
 * @param {Object} obj The object to whiche the context will be bound.
 */
bindTo = context.bindTo = function(obj) {
  obj['context'] = context;
}


/**
 * Returns the run properties that users can store intermediate data.
 * @returns {Object} The run properties.
 */
runProperties = context.runProperties = function() {
  'use strict';
  return _runProperties;
}

context.properties = context.props = context.runProperties;
reset = context.reset = function() {
  'use strict';
  _runProperties = {};
}

/**
 * Resolves the given property name and returns the run property or `null` if
 * the property does not exist.
 *
 * Examples:
 *
 * ```
 * 'use strict';
 * var assert = require('assert'), props, baz;
 *
 * props = context.runProperties();
 * props.foo.bar = {x: 1, y: 1};
 * baz = context.resolveProperty('foo.bar');
 * assert.strictEqual(baz, props.foo.bar);
 * ```
 *
 * @param {string|Array.<string>} propertyName The name of the property or an
 * array of strings that compose the full property name.
 *
 * @param {Object} [options] The resolve options.
 *
 * @param {*} [options.createIfMissing] If the given `propertyName` does not
 * resolve to a value then the property will be created with the value of
 * `options.createIfMissing`.
 *
 * @returns {*} The resolved run property or `null` if the property does not
 * exist.
 */
resolveProperty = context.resolveProperty = function(propertyName, options) {
  'use strict';
  var debug = d_rp
    , prop
    , parts
    ;

  options = options || {};

  debug("propertyName: %s", u.inspect(propertyName));

  if (!propertyName) {
    throw new Error('Property name is required.');
  }

  if (_.isString(propertyName)) {
    parts = _splitPropertyName(propertyName);

  } else if (_.isArray(propertyName)) {
    parts = propertyName;

  } else {
    throw new Error(u.format("Unsupported propertyName type: %s", typeof propertyName));
  }

  debug("parts: %s", u.inspect(parts));
  prop = _resolveProp([].concat(parts), _runProperties);

  if (!_.isUndefined(options.createIfMissing)) {
    prop = _descendAndCreateProp([].concat(parts), _runProperties, options.createIfMissing);
  }

  return prop;
}

context.getProp = context.getProperty = context.property = context.resolveProp = context.resolveProperty;

function _resolveIsDescendable(obj) {
  return !(
    _.isUndefined(obj) || _.isNull(obj) || _.isFunction(obj) ||
    _.isArray(obj) || _.isString(obj) || _.isNumber(obj) ||
    _.isDate(obj) || _.isRegExp(obj) || _.isArguments(obj)
  );
}

function _resolveIsReturnable(obj) {
  return (
    _.isNull(obj) || _.isFunction(obj) ||
    _.isArray(obj) || _.isString(obj) || _.isNumber(obj) ||
    _.isDate(obj) || _.isRegExp(obj) || _.isArguments(obj)
  );
}

function _resolveProp(parts, parent) {
  'use strict';
  var debug = d__rp
    , k
    , len
    , found
    ;

  len = parts.length;

  debug("(%s) parts: %s", len, u.inspect(parts));
  debug("(%s) parent: %s", len, u.inspect(parent));

  if (len === 0) {
    throw new Error("Should not have descended this far.");

  } else {
    if (_.isUndefined(parent)) return parent;

    k = parts.shift();

    found = parent[k];
    debug("(%s) %s found? %s", len, k, u.inspect(found));
    // debug("(%s) found is descendable? %s", len, _resolveIsDescendable(found));

    if (_resolveIsDescendable(found)) {
      // We are at the end.

      if (len === 1) {
        return found;

      } else {
        return _resolveProp(parts, found);

      }

    } else {
      return found;

    }

  }

}

function _descendAndCreateProp(parts, parent, value) {
  'use strict';
  var debug = d__dacp
    , len
    , k
    , found
    , isUndefined
    ;

  len = parts.length;

  debug("(%s) parts: %s", len, u.inspect(parts));
  debug("(%s) parent: %s", len, u.inspect(parent));

  if (parts.length === 0) {
    throw new Error("Should not have descended this far.");

  } else {
    k = parts.shift();

    found = parent[k];
    debug("(%s) found: %s", len, u.inspect(found));
    isUndefined = _.isUndefined(found);

    if (len === 1) {
      // We are at the end.
      if (isUndefined) {
        debug("(%s) Setting %s property to value: %s", len, k, u.inspect(value));
        found = parent[k] = value;
      }
      return found;

    } else {
      if (isUndefined) {
        debug("(%s) Creating intermediate plain object at %s.", len, k);
        found = parent[k] = {};
      }
      return _descendAndCreateProp(parts, found, value);
    }

  }

}

/**
 * Sets the given property to the given value.
 *
 * @param {string|Array.<string>} propertyName The property name.
 * @param {*} value The property's value.
 */
setProperty = context.setProperty = function(propertyName, value) {
  'use strict';
  var debug = d_setp
    , prop
    ;

  prop = resolveProperty(propertyName, {createIfMissing: value});
  prop = value;

  return prop;
}

context.setProp = context.setProperty;


/**
 * Removes the given property.
 *
 * @param {string|Array.<string>} propertyName The name of the property or an
 * array of strings that compose the full property name.
 *
 * @returns {*} The value of the property that was removed or 'undefined' if
 * the property did not exist.
 */
removeProperty = context.removeProperty = function(propertyName) {
  'use strict';
  var debug = d_setp
    , parent
    , parentParts
    , prop
    , parts
    , propName
    , result
    ;

  if (_.isString(propertyName)) {
    parts = _splitPropertyName(propertyName);

  } else if (_.isArray(propertyName)) {
    parts = propertyName;

  } else {
    throw new Error(u.format("Unsupported propertyName type: %s", typeof propertyName));
  }

  propName = _.last(parts);
  parentParts = _.initial(parts);

  prop = resolveProperty(propertyName);
  if (!_.isUndefined(prop)) {
    result = prop;
    parent = resolveProperty(parentParts);

    if (!_.isUndefined(parent)) {
      delete parent[propName];
    }
  }

  return result;
}

context.removeProp = context.removeProperty;

function _splitPropertyName(propertyName) {
  'use strict';
  return propertyName.split(OBJ_SEP_RE);
}


/**
 * Loads this context with the given JSON or plain object.
 * 
 * @param {string|Object} data The string of JSON or the object to load into is
 * @param {string|Array} [propertyName] The property name to assign the data to.
 * context.
 *
 */
loadWith = context.loadWith = function(data, propertyName) {
  'use strict';
  var d = null;
  if (data) {
    if (_.isString(data)) {
      d = JSON.parse(data);
    } else if (_.isObject(data)) {
      d = data;
    }
  }

  if (propertyName) {
    setProperty(propertyName, d);
  } else {
    _runProperties = _.extend(_runProperties, data);
  }

}
