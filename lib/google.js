'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

var _canvasHelper = require('./canvasHelper');

var _canvasHelper2 = _interopRequireDefault(_canvasHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Google = function (_React$Component) {
  _inherits(Google, _React$Component);

  function Google() {
    _classCallCheck(this, Google);

    return _possibleConstructorReturn(this, (Google.__proto__ || Object.getPrototypeOf(Google)).apply(this, arguments));
  }

  _createClass(Google, [{
    key: 'showAdNode',
    value: function showAdNode() {
      this.adNode.style.display = 'block';
    }
  }, {
    key: 'hideAdNode',
    value: function hideAdNode() {
      this.adNode.style.display = 'none';
    }
  }, {
    key: 'checkIfAdIsEmptyWithCachedIframe',
    value: function checkIfAdIsEmptyWithCachedIframe() {
      console.log('body.innerHTML', this.iframeWithAd.body.innerHTML, this.iframeWithAd.body.innerHTML.length);
      if (!this.iframeWithAd.body.innerHTML || this.iframeWithAd.body.innerHTML.length === 0) {
        this.hideAdNode();
      } else {
        this.showAdNode();
      }

      // check again after some time:
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.checkAdTimerCounter < 5) {
        var that = this;
        this.timer = setTimeout(function () {
          console.log(Date.now(), 'after setTimeout', that.checkAdTimerCounter);
          that.checkIfAdIsEmpty.call(that); // use `call` to have the correct scope in the function later
          that.checkAdTimerCounter += 1;
        }, 1000);
      }
    }
  }, {
    key: 'checkIfAdIsEmpty',
    value: function checkIfAdIsEmpty() {
      console.log(new Date(), 'now check if there is something in the iframe', this.adNode);
      var iframeOutter = this.adNode.getElementsByTagName('iframe')[0];
      if (!iframeOutter) return;
      iframeOutter = iframeOutter.contentDocument || iframeOutter.contentWindow.document;
      // console.log('iframeOutter:', iframeOutter);

      this.iframeWithAd = iframeOutter.getElementsByTagName('iframe');
      // [0] = google_esf; this is only in the first Ad, if you have more than 2 Ads on a page, then
      // the second iframe does not include this google_esf iframe
      // [1] = google_ads_frame[x]
      this.iframeWithAd = this.iframeWithAd[1] || this.iframeWithAd[0];
      if (!this.iframeWithAd) return;
      try {
        console.log('1', this.iframeWithAd);
        console.log('2', this.iframeWithAd.innerHTML);
        this.iframeWithAd = this.iframeWithAd.contentDocument || this.iframeWithAd.contentWindow.document;
        this.checkIfAdIsEmptyWithCachedIframe();
      } catch (e) {
        // DOMException: Blocked a frame with origin ...
        // when it fails to access the iframe, then we know that the Ad is in there ;)
        console.warn('iframeWithAd access:', e);
        this.showAdNode();
      }
    }
  }, {
    key: 'startObserver',
    value: function startObserver() {
      var _this2 = this;

      this.adNode = document.getElementById(this.uniqueId);
      console.log('startObserver on:', this.adNode);

      var callback = function callback(mutationsList) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = mutationsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var mutation = _step.value;

            console.log('mutation', new Date(), {
              type: mutation.type,
              attributeName: mutation.attributeName,
              targetId: mutation.target.id,
              adNodeId: _this2.adNode.id
            }, mutation);
            if (
            // all-non style
            mutation.attributeName !== 'style'
            // all style, but not the adNode element, otherwise circular hell
            || mutation.attributeName === 'style' && mutation.target.id !== _this2.adNode.id) {
              _this2.checkIfAdIsEmpty();
            }

            // if (mutation.type === 'attributes') {
            //   console.log(this.uniqueId, 'The "' + mutation.attributeName + '" attribute was modified.');
            //   // google sdk changes this attr to "done" once its done
            //   if (mutation.attributeName === 'data-adsbygoogle-status') {
            //     // now check if there is something in the iframe
            //     this.checkIfAdIsEmpty(this.adNode);
            //   }
            // }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      };

      // Create an observer instance linked to the callback function
      this.observer = new MutationObserver(callback);
      // Start observing the target node for configured mutations
      this.observer.observe(this.adNode, { attributes: true, childList: true, subtree: true });
    }
  }, {
    key: 'stopObserver',
    value: function stopObserver() {
      this.checkAdTimerCounter = 999999; // to avoid setTimeout running forever
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }, {
    key: 'checkIfAdIsEmptyWithScreenshot',
    value: function checkIfAdIsEmptyWithScreenshot() {
      var _this3 = this;

      var that = this;
      this.adNode = document.getElementById(this.uniqueId);
      setTimeout(function () {
        console.time('checkIfAdIsEmptyWithScreenshot');
        (0, _html2canvas2.default)(_this3.adNode, { logging: false, useCORS: true, allowTaint: false }).then(function (canvas) {
          console.timeEnd('checkIfAdIsEmptyWithScreenshot');
          document.body.appendChild(canvas); // TODO rm
          console.time('getContext');
          var ctx = canvas.getContext('2d');
          console.timeEnd('getContext');
          console.time('checker');
          var startPixel = 5; // sometimes Ad container have a border, do not take possible border into account
          var pixelColorMatch = true;
          var firstPixel = _canvasHelper2.default.getCanvasPixelColor(ctx, startPixel, startPixel);
          for (var x = startPixel; x <= canvas.width - startPixel && pixelColorMatch; x += 5) {
            for (var y = startPixel; y <= canvas.height - startPixel && pixelColorMatch; y += 5) {
              // console.log(x, y, '\t', firstPixel.rgbm, canvasHelper.getCanvasPixelColor(ctx, x, y).rgb,
              //   firstPixel.rgb === canvasHelper.getCanvasPixelColor(ctx, x, y).rgb);
              if (firstPixel.rgb !== _canvasHelper2.default.getCanvasPixelColor(ctx, x, y).rgb) {
                pixelColorMatch = false;
              }
            }
          }
          console.timeEnd('checker');

          console.log({ pixelColorMatch: pixelColorMatch });
          if (pixelColorMatch) {
            _this3.hideAdNode();
          } else {
            _this3.showAdNode();
          }
        });
      }, 2000);
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.uniqueId = 'gad_' + Math.round(Math.random() * 1000000);
      this.checkAdTimerCounter = 0;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.autoCollapseEmptyAds) {
        this.startObserver();
      }
      if (this.props.autoCollapseEmptyAdsWithScreenshot) {
        this.checkIfAdIsEmptyWithScreenshot();
      }
      try {
        if (window) (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('warn with google adsense:', e);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.stopObserver();
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement('ins', { className: this.props.className + ' adsbygoogle',
        id: this.uniqueId,
        style: this.props.style,
        'data-ad-client': this.props.client,
        'data-ad-slot': this.props.slot,
        'data-ad-layout': this.props.layout,
        'data-ad-layout-key': this.props.layoutKey,
        'data-ad-format': this.props.format,
        'data-full-width-responsive': this.props.responsive
      });
    }
  }]);

  return Google;
}(_react2.default.Component);

exports.default = Google;
;

Google.propTypes = {
  className: _propTypes2.default.string,
  style: _propTypes2.default.object, // eslint-disable-line
  client: _propTypes2.default.string.isRequired,
  slot: _propTypes2.default.string.isRequired,
  layout: _propTypes2.default.string,
  layoutKey: _propTypes2.default.string,
  format: _propTypes2.default.string,
  responsive: _propTypes2.default.string,
  autoCollapseEmptyAds: _propTypes2.default.bool
};

Google.defaultProps = {
  className: '',
  style: { display: 'block' },
  format: 'auto',
  layout: '',
  responsive: 'false',
  autoCollapseEmptyAds: false,
  autoCollapseEmptyAdsWithScreenshot: false
};