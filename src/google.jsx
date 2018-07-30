import React from 'react';
import PropTypes from 'prop-types';

export default class Google extends React.Component {
  startObserver() {
    // Select the node that will be observed for mutations
    const targetNode = document.getElementById(this.uniqueId);

    const callback = (mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes') {
          console.log(this.uniqueId, 'The "' + mutation.attributeName + '" attribute was modified.');
          if (mutation.attributeName === 'data-adsbygoogle-status') {
            // now check if there is something in the iframe
            console.log('now check if there is something in the iframe');
            let iframeOutter = targetNode.getElementsByTagName('iframe')[0];
            if (!iframeOutter) return;
            iframeOutter = iframeOutter.contentDocument || iframeOutter.contentWindow.document;
            console.log('iframeOutter:', iframeOutter);

            let iframeWithAd = iframeOutter.getElementsByTagName('iframe');
            // [0] = google_esf; this is only in the first Ad, if you have more than 2 Ads on a page, then
            // the second iframe does not include this google_esf iframe
            // [1] = google_ads_frame[x]
            iframeWithAd = iframeWithAd[1] || iframeWithAd[0];
            if (!iframeWithAd) return;
            iframeWithAd = iframeWithAd.contentDocument || iframeWithAd.contentWindow.document;

            console.log('iframeWithAd:', iframeWithAd);
            console.log('body', iframeWithAd.body);
            console.log('.innerHTML', iframeWithAd.body.innerHTML, iframeWithAd.body.innerHTML.length);
            if (!iframeWithAd.body.innerHTML || iframeWithAd.body.innerHTML.length === 0) {
              // hide the Ad
              targetNode.style.display = 'none';
            }
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    this.observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    this.observer.observe(targetNode, { attributes: true });

  }

  stopObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  componentWillMount() {
    this.uniqueId = `gad_${Math.round(Math.random() * 1000000)}`;
  }

  componentDidMount() {
    if (this.props.autoCollapseEmptyAds) {
      this.startObserver();
    }

    if (window) (window.adsbygoogle = window.adsbygoogle || []).push({});
  };

  componentWillUnmount() {
    console.log('unmount');
    this.stopObserver();
  }

  checkIfChanged() {

    setTimeout(this.checkIfChanged, 2000);
  }

  render() {
    console.log('render', this.uniqueId);

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
