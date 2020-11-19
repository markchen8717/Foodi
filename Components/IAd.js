import React, { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds, AdsConsentStatus } from '@react-native-firebase/admob';
import { fetchDataAsync, setDataAsync } from '../API/Storage';
import { REACT_APP_GOOGLE_INTERSTITIAL_AD_UNIT_ID, REACT_APP_BUILD_ENV, REACT_APP_ADS } from 'react-native-dotenv';

export const isInteruptReadyAsync = async () => {
  const numOfScansAndSearchesSinceI = JSON.parse(await fetchDataAsync("numOfScansAndSearchesSinceI"));
  return numOfScansAndSearchesSinceI > 5;
}

var interstitial = null;
export default function IAd(props) {
  const [loaded, setLoaded] = useState(false);
  const [showed, setShowed] = useState(false);

  const initialize = () => {
    interstitial = InterstitialAd.createForAdRequest((REACT_APP_BUILD_ENV === "RELEASE") ? REACT_APP_GOOGLE_INTERSTITIAL_AD_UNIT_ID : TestIds.INTERSTITIAL,
      {
        requestNonPersonalizedAdsOnly:
          props.adConsentStatus === AdsConsentStatus.NON_PERSONALIZED,
        keywords: ['healthy', 'organic', 'food'],
      });
    interstitial.onAdEvent(type => {
      if (type === AdEventType.LOADED) {
        setLoaded(true);
      }
    });
    interstitial.load();
    setLoaded(false);
    setShowed(false);
  }

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    let isCancelled = false

    const postUpdate = async () => {
      await setDataAsync("numOfScansAndSearchesSinceI", JSON.stringify(0));
      props.setTrigger(false);
    }

    if (!isCancelled) {
      if (showed) {
        postUpdate();
        initialize();
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [showed]);

  if (props.trigger && !showed && loaded) {
    interstitial.show();
    setShowed(true)
  }
  return null;
}