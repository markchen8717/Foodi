import React, { useState, useEffect, Fragment } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, AdsConsentStatus } from '@react-native-firebase/admob';
import { REACT_APP_GOOGLE_BANNER_AD_UNIT_ID, REACT_APP_BUILD_ENV } from 'react-native-dotenv';

export default function Ad(props) {
    useEffect(() => {
        console.log("build env:", REACT_APP_BUILD_ENV, "isRelease:",REACT_APP_BUILD_ENV === "RELEASE");
        console.log("ad consent status:", props.adConsentStatus);
    }, []);
    return (
        <Fragment>
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