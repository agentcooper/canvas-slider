!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Slider=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function fitToScreen(image, screenWidth, screenHeight) {
  var ratio = image.width / image.height;

  var height = image.height,
      width = image.width,
      x = 0,
      y = 0,
      resized = false;

  if (image.height > screenHeight) {
    height = screenHeight;
    width = ratio * height;
  } else {
    height = image.height;
    resized = true;
  }

  if (width > screenWidth) {
    width = screenWidth;
    height = width / ratio;
  } else {
    if (resized) {
      width = image.width;
    }
  }

  y += (screenHeight - height) / 2;
  x += (screenWidth - width) / 2;

  return {
    image: image,
    x: x,
    y: y,
    width: width,
    height: height
  };
}

module.exports = fitToScreen;

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var fitToScreen = require('./fitToScreen');

var utils = require('./utils');

var Slider = (function () {
  function Slider(options) {
    var _this = this;

    _classCallCheck(this, Slider);

    this.el = options.el;

    this.ctx = options.el.getContext('2d');

    this.width = this.el.width;
    this.height = this.el.height;

    // drag offset
    this.offsetX = 0;

    this.backgroundColor = options.backgroundColor;

    this.urls = options.images;

    // loaded images
    this.images = [];
    this.loaded = 0;

    this.inner = document.createElement('canvas');

    this.promise = null;

    this.bindEvents();
    this.loadNextImage().then(function () {
      return _this.render();
    });
  }

  _createClass(Slider, [{
    key: 'loadNextImage',
    value: function loadNextImage() {
      var _this2 = this;

      this.promise = this.promise || new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          _this2.images.push(img);
          _this2._updateInnerCanvas();

          _this2.loaded = _this2.loaded + 1;

          _this2.promise = null;
          resolve(img);
        };
        img.onerror = function () {
          reject(img);
        };
        img.src = _this2.urls[_this2.loaded];
      });

      return this.promise;
    }
  }, {
    key: '_updateInnerCanvas',
    value: function _updateInnerCanvas() {
      var _this3 = this;

      var position = this.images.map(function (image) {
        return fitToScreen(image, _this3.width, _this3.height);
      });

      this.inner.width = this.width * this.images.length;
      this.inner.height = this.height;

      var innerCtx = this.inner.getContext('2d');

      innerCtx.fillStyle = this.backgroundColor;
      innerCtx.fillRect(0, 0, this.inner.width, this.inner.height);

      position.forEach(function (pos, index) {
        innerCtx.drawImage(pos.image, pos.x + index * _this3.width, pos.y, pos.width, pos.height);
      });
    }
  }, {
    key: 'setOffset',
    value: function setOffset(offset) {
      var _this4 = this;

      return new Promise(function (resolve) {
        var update = function update() {
          _this4.offsetX = utils.clamp(offset, 0, _this4.inner.width - _this4.width);
          resolve();
        };

        if (offset > _this4.inner.width - _this4.width && _this4.loaded < _this4.urls.length) {
          _this4.loadNextImage().then(update);
        } else {
          update();
        }
      });
    }
  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      var _this5 = this;

      var DRAG_CLASSNAME = 'drag-active';

      var moveListener = null;

      this.el.addEventListener('mousedown', function (mousedownEvent) {
        var pageX = mousedownEvent.pageX,
            offsetX = _this5.offsetX;

        moveListener = function (mousemoveEvent) {
          _this5.setOffset(offsetX + (pageX - mousemoveEvent.pageX)).then(function () {
            window.requestAnimationFrame(function () {
              return _this5.render();
            });
          });
        };

        window.addEventListener('mousemove', moveListener);

        _this5.el.classList.add(DRAG_CLASSNAME);
      });

      window.addEventListener('mouseup', function () {
        _this5.el.classList.remove(DRAG_CLASSNAME);

        if (moveListener) {
          window.removeEventListener('mousemove', moveListener);
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.drawImage(this.inner, this.offsetX, 0, this.width, this.height, 0, 0, this.width, this.height);
    }
  }]);

  return Slider;
})();

module.exports = Slider;

},{"./fitToScreen":1,"./utils":3}],3:[function(require,module,exports){
'use strict';

module.exports = {
  clamp: function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }
};

},{}]},{},[2])(2)
});