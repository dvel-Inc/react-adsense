'use strict';

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) throw new Error('Invalid color component');
  return (r << 16 | g << 8 | b).toString(16);
}

/**
 * getCanvasPixelColor
 * @param  {canvas|context} ctx  The canvas from which to take the color
 * @param  {int} x                       The x coordinate of the pixel to read
 * @param  {int} y                       The y coordinate of the pixel to read
 * @return {array/object}                The rgb values of the read pixel
 */
exports.getCanvasPixelColor = function getCanvasPixelColor(ctx, x, y) {
  // if it's not a context, it's probably a canvas element
  if (!ctx.getImageData) {
    console.log('getContext');
    ctx = ctx.getContext('2d');
  }

  // extract the pixel data from the canvas
  var pixel = ctx.getImageData(x, y, 1, 1).data;

  // set each color property
  pixel.r = pixel[0];
  pixel.b = pixel[1];
  pixel.g = pixel[2];
  pixel.a = pixel[3];

  // convenience CSS strings
  pixel.rgb = 'rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ')';
  pixel.rgba = 'rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ',' + pixel.a + ')';
  // pixel.hex = rgbToHex(pixel.r, pixel.g, pixel.b);

  return pixel;
};