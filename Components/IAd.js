import React, { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds,AdsConsentStatus } from '@react-native-firebase/admob';
import { fetchDataAsync, setDataAsync } from '../API/Storage';
import { REACT_APP_GOOGLE_INTERSTITIAL_AD_UNIT_ID, REACT_APP_BUILD_ENV, REACT_APP_ADS } from 'react-native-dotenv';

export const isInteruptReadyAsync = async () => {
  const numOfScansAndSearchesSinceI = JSON.parse(await fetchDataAsync("numOfScansAndSearchesSinceI"));
  return numOfScansAndSearchesSinceI > 5;
}

export default function IAd(props) {
  const [interstitial, setInterstitial] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [showed, setShowed] = useState(false);

  useEffect(() => {

    let isCancelled = false
    const initialize = () => {
      
      if (!isCancelled) {
        setInterstitial(InterstitialAd.createForAdRequest((REACT_APP_BUILD_ENV === "RELEASE") ? REACT_APP_GOOGLE_INTERSTITIAL_AD_UNIT_ID : TestIds.INTERSTITIAL,
          {
            requestNonPersonalizedAdsOnly:
              props.adConsentStatus === AdsConsentStatus.NON_PERSONALIZED,
            keywords: ['healthy', 'organic', 'food'],
          }))
        setShowed(false)
        setLoaded(false)
      }
    }
    const main = async () => {
      await setDataAsync("numOfScansAndSearchesSinceI", JSON.stringify(0));
      props.setTrigger(false);

    }


    if (showed) {
      main()
    }
    initialize()





    // Start loading the interstitial straight away
    // interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      isCancelled = true;
    };
  }, [showed]);

  useEffect(() => {
    let eventListener = () => { }
    if (interstitial !== null) {
      interstitial.load()
      eventListener = interstitial.onAdEvent(type => {
        if (type === AdEventType.LOADED) {
          setLoaded(true);
        }
      })
    }
    return () => {
      eventListener();
    }
  }, [interstitial])



  // console.log("interstitial", interstitial)
  // console.log("loaded", loaded)
  // console.log("showed", showed)

  if (props.trigger && !showed && loaded) {
    interstitial.show();
    setShowed(true)
  }
  return null;
}