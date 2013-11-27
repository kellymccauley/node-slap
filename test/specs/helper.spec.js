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

