import React from 'react';
import PropTypes from 'prop-types';

export default class Google extends React.Component {
  checkIfAdIsEmptyWithCachedIframe() {
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
      const that = this;
      this.timer = setTimeout(() => {
        console.log(Date.now(), 'after setTimeout', that.checkAdTimerCounter);
        that.checkIfAdIsEmpty.call(that); // use `call` to have the correct scope in the function later
        that.checkAdTimerCounter += 1;
      }, 1000);
    }
  }

  checkIfAdIsEmpty() {
    if (this.iframeWithAd) {
      // iframeWithAd is already cached
      this.checkIfAdIsEmptyWithCachedIframe();
      return;
    }

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
    this.iframeWithAd = this.iframeWithAd.contentDocument || this.iframeWithAd.contentWindow.document;

    this.checkIfAdIsEmptyWithCachedIframe();
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
        // if (
        //   // all-non style
        //   mutation.attributeName !== 'style'
        //   // all style, but not the adNode element, otherwise circular hell
        //   || (mutation.attributeName === 'style' && mutation.target.id !== this.adNode.id)
        // ) {
        this.checkIfAdIsEmpty();
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

  componentWillMount() {
    this.uniqueId = `gad_${Math.round(Math.random() * 1000000)}`;
    this.checkAdTimerCounter = 0;
  }

  componentDidMount() {
    if (this.props.autoCollapseEmptyAds) {
      this.startObserver();
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
};
