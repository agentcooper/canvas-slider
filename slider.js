'use strict';

var fitToScreen = require('./fitToScreen');

var utils = require('./utils');

class Slider {
  constructor(options) {
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
    this.loadNextImage().then(() => this.render());
  }

  loadNextImage() {
    this.promise = this.promise || new Promise((resolve, reject) => {
      var img = new Image();
      img.onload = () => {
        this.images.push(img);
        this._updateInnerCanvas();

        this.loaded = this.loaded + 1;

        this.promise = null;
        resolve(img);
      };
      img.onerror = () => { reject(img); };
      img.src = this.urls[this.loaded];
    });

    return this.promise;
  }

  _updateInnerCanvas() {
    var position = this.images.map((image) => {
      return fitToScreen(image, this.width, this.height);
    });

    this.inner.width = this.width * this.images.length;
    this.inner.height = this.height;

    var innerCtx = this.inner.getContext('2d');

    innerCtx.fillStyle = this.backgroundColor;
    innerCtx.fillRect(0, 0, this.inner.width, this.inner.height);

    position.forEach((pos, index) => {
      innerCtx.drawImage(
        pos.image,
        pos.x + index * this.width, pos.y,
        pos.width, pos.height
      );
    });
  }

  setOffset(offset) {
    return new Promise((resolve) => {
      var update = () => {
        this.offsetX = utils.clamp(offset, 0, this.inner.width - this.width);
        resolve();
      };

      if (offset > this.inner.width - this.width && this.loaded < this.urls.length) {
        this.loadNextImage().then(update);
      } else {
        update();
      }
    });
  }

  bindEvents() {
    var DRAG_CLASSNAME = 'drag-active';

    var moveListener = null;

    this.el.addEventListener('mousedown', (mousedownEvent) => {
      var pageX = mousedownEvent.pageX,
          offsetX = this.offsetX;

      moveListener = (mousemoveEvent) => {
        this.setOffset(offsetX + (pageX - mousemoveEvent.pageX)).then(() => {
          window.requestAnimationFrame(() => this.render());
        });
      };

      window.addEventListener('mousemove', moveListener);

      this.el.classList.add(DRAG_CLASSNAME);
    });

    window.addEventListener('mouseup', () => {
      this.el.classList.remove(DRAG_CLASSNAME);

      if (moveListener) {
        window.removeEventListener('mousemove', moveListener);
      }
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(
      this.inner,
      this.offsetX, 0,
      this.width, this.height,
      0, 0,
      this.width, this.height
    );
  }
}

module.exports = Slider;
