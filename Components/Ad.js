import React, { useEffect, Fragment } from 'react';
import { BannerAd, BannerAdSize, TestIds, AdsConsentStatus } from '@react-native-firebase/admob';
import { REACT_APP_GOOGLE_BANNER_AD_UNIT_ID, REACT_APP_BUILD_ENV, REACT_APP_ADS } from 'react-native-dotenv';

export default function Ad(props) {
    useEffect(() => {
        console.log("build env:", REACT_APP_BUILD_ENV, "show ads:", REACT_APP_ADS);
        console.log("adUnitID:", REACT_APP_GOOGLE_BANNER_AD_UNIT_ID);
        console.log("ad consent status:", props.adConsentStatus);
    }, []);
    if (REACT_APP_ADS !== "FALSE" ) {
        return (
            <Fragment >
                {
                    props.adType === "banner" &&
                    <BannerAd
                        unitId={(REACT_APP_BUILD_ENV === "RELEASE") ? REACT_APP_GOOGLE_BANNER_AD_UNIT_ID : TestIds.BANNER}
                        size={BannerAdSize.SMART_BANNER}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: props.adConsentStatus === AdsConsentStatus.NON_PERSONALIZED,
                        }}
                        onAdLoaded={() => {
                            console.log('Advert loaded');
                        }}
                        onAdFailedToLoad={(error) => {
                            console.log('Advert failed to load: ', error);
                        }}
                    />
                }
            </Fragment>
        );
    }
    else
        return (<Fragment></Fragment>);
}