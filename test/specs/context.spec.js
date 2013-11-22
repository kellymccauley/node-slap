'use strict';
var context = require('../../context')
  , should = require('should')
;

describe('context', function() {
  describe('resolveProperty()', function() {

    it("should throw an error if a property name was not given.", function() {
      var propertyName;
      
      (function() {
        context.resolveProperty(propertyName);
      }).should.throwError(/^.*required/);

    });

    it("should, by default, return `null` for a property name could not be resolved.", function() {
      var propertyName = 'foo.bar'
        , result = context.resolveProperty(propertyName);

      should.not.exist(result);

    });

    
  });
});
