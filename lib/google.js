'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
    key: 'checkIfAdIsEmptyWithCachedIframe',
    value: function checkIfAdIsEmptyWithCachedIframe() {
      console.log('body.innerHTML', this.iframeWithAd.body.innerHTML, this.iframeWithAd.body.innerHTML.length);
      if (!this.iframeWithAd.body.innerHTML || this.iframeWithAd.body.innerHTML.length === 0) {
        // hide the Ad
        this.adNode.style.display = 'none';
      } else {
        this.adNode.style.display = 'block';
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
      if (this.iframeWithAd) {
        // iframeWithAd is already cached
        this.checkIfAdIsEmptyWithCachedIframe();
        return;
      }

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
      this.iframeWithAd = this.iframeWithAd.contentDocument || this.iframeWithAd.contentWindow.document;

      this.checkIfAdIsEmptyWithCachedIframe();
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
            // if (
            //   // all-non style
            //   mutation.attributeName !== 'style'
            //   // all style, but not the adNode element, otherwise circular hell
            //   || (mutation.attributeName === 'style' && mutation.target.id !== this.adNode.id)
            // ) {
            _this2.checkIfAdIsEmpty();
            // }

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

      if (window) (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.stopObserver();
    }
  }, {
    key: 'render',
    value: function render() {
      console.log('render ad:', this.uniqueId);

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
  autoCollapseEmptyAds: false
};