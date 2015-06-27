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
