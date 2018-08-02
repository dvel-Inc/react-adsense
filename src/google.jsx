import React from 'react';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';
import canvasHelper from './canvasHelper';

export default class Google extends React.Component {

  showAdNode() {
    this.adNode.style.display = 'block';
  }

  hideAdNode() {
    this.adNode.style.display = 'none';
  }

  checkIfAdIsEmptyWithCachedIframe() {
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
      const that = this;
      this.timer = setTimeout(() => {
        console.log(Date.now(), 'after setTimeout', that.checkAdTimerCounter);
        that.checkIfAdIsEmpty.call(that); // use `call` to have the correct scope in the function later
        that.checkAdTimerCounter += 1;
      }, 1000);
    }
  }

  checkIfAdIsEmpty() {
    console.log(new Date(), 'now check if there is something in the iframe', this.adNode);
    let iframeOutter = this.adNode.getElementsByTagName('iframe')[0];
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

  startObserver() {
    this.adNode = document.getElementById(this.uniqueId);
    console.log('startObserver on:', this.adNode);

    const callback = (mutationsList) => {
      for (let mutation of mutationsList) {
        console.log('mutation', new Date(), {
            type: mutation.type,
            attributeName: mutation.attributeName,
            targetId: mutation.target.id,
            adNodeId: this.adNode.id,
          },
          mutation);
        if (
          // all-non style
          mutation.attributeName !== 'style'
          // all style, but not the adNode element, otherwise circular hell
          || (mutation.attributeName === 'style' && mutation.target.id !== this.adNode.id)
        ) {
          this.checkIfAdIsEmpty();
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
    };

    // Create an observer instance linked to the callback function
    this.observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    this.observer.observe(this.adNode, { attributes: true, childList: true, subtree: true });
  }

  stopObserver() {
    this.checkAdTimerCounter = 999999; // to avoid setTimeout running forever
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  checkIfAdIsEmptyWithScreenshot() {
    const that = this;
    this.adNode = document.getElementById(this.uniqueId);
    setTimeout(() => {
      console.time('checkIfAdIsEmptyWithScreenshot');
      html2canvas(this.adNode, { logging: false, useCORS: true, allowTaint: false })
        .then((canvas) => {
          console.timeEnd('checkIfAdIsEmptyWithScreenshot');
          document.body.appendChild(canvas); // TODO rm
          console.time('getContext');
          const ctx = canvas.getContext('2d');
          console.timeEnd('getContext');
          console.time('checker');
          const startPixel = 5; // sometimes Ad container have a border, do not take possible border into account
          let pixelColorMatch = true;
          let firstPixel = canvasHelper.getCanvasPixelColor(ctx, startPixel, startPixel);
          for (let x = startPixel; x <= canvas.width - startPixel && pixelColorMatch; x += 5) {
            for (let y = startPixel; y <= canvas.height - startPixel && pixelColorMatch; y += 5) {
              // console.log(x, y, '\t', firstPixel.rgbm, canvasHelper.getCanvasPixelColor(ctx, x, y).rgb,
              //   firstPixel.rgb === canvasHelper.getCanvasPixelColor(ctx, x, y).rgb);
              if (firstPixel.rgb !== canvasHelper.getCanvasPixelColor(ctx, x, y).rgb) {
                pixelColorMatch = false;
              }
            }
          }
          console.timeEnd('checker');

          console.log({ pixelColorMatch });
          if (pixelColorMatch) {
            this.hideAdNode();
          } else {
            this.showAdNode();
          }
        });
    }, 2000);

  }

  componentWillMount() {
    this.uniqueId = `gad_${Math.round(Math.random() * 1000000)}`;
    this.checkAdTimerCounter = 0;
  }

  componentDidMount() {
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
  };

  componentWillUnmount() {
    this.stopObserver();
  }

  render() {
    return (
      <ins className={`${this.props.className} adsbygoogle`}
           id={this.uniqueId}
           style={this.props.style}
           data-ad-client={this.props.client}
           data-ad-slot={this.props.slot}
           data-ad-layout={this.props.layout}
           data-ad-layout-key={this.props.layoutKey}
           data-ad-format={this.props.format}
           data-full-width-responsive={this.props.responsive}
      >
      </ins>
    );
  }
};

Google.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object, // eslint-disable-line
  client: PropTypes.string.isRequired,
  slot: PropTypes.string.isRequired,
  layout: PropTypes.string,
  layoutKey: PropTypes.string,
  format: PropTypes.string,
  responsive: PropTypes.string,
  autoCollapseEmptyAds: PropTypes.bool,
};

Google.defaultProps = {
  className: '',
  style: { display: 'block' },
  format: 'auto',
  layout: '',
  responsive: 'false',
  autoCollapseEmptyAds: false,
  autoCollapseEmptyAdsWithScreenshot: false,
};
