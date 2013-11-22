'use strict';
var helper = require('../../helper')
  , should = require('should')
;

describe('helper', function() {
  describe('findPropertyNames()', function() {
    it('should find the name of a property that exists in an object.', function() {
      var propertyName = 'foo'
        , expected = [propertyName]
        , obj = { foo: 1, xyz: 9 }
        , actual;

      actual = helper.findPropertyNames(obj, propertyName);

      actual.should.not.be.empty;
      actual.should.eql(expected);
    });

    it('should not find the name of a property that does not exist an object.', function() {
      var propertyName = 'xyz'
        , expected = []
        , obj = { foo: 1 }
        , actual;

      actual = helper.findPropertyNames(obj, propertyName);

      actual.should.be.empty;

    });

    it('by using a regular expression, should find the names of the properties that exists in an object.', function() {
      var propertyName = /foo.*/
        , expected = ['foo', 'food', 'fool']
        , obj = { foo: 1, food: 2, fool: 3, bar: 4 }
        , actual;

      actual = helper.findPropertyNames(obj, propertyName);

      actual.should.not.be.empty;
      actual.should.have.lengthOf(expected.length);
      expected.forEach(function(exp) {
        actual.should.contain(exp);
      });
    });

    it('by using a filter callback function, should find the names of the properties that exists in an object.', function() {
      var propertyName = function(val, key, obj) {
            return ((typeof val === 'number') && (val > 1));
          }
        , expected = ['food', 'fool', 'bar']
        , obj = { foo: 1, food: 2, fool: 3, bar: 4 }
        , actual;

      actual = helper.findPropertyNames(obj, propertyName);

      actual.should.not.be.empty;
      actual.should.have.lengthOf(expected.length);
      expected.forEach(function(exp) {
        actual.should.contain(exp);
      });
    });



  });
});
