import React, { useState, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import SearchIngredientsPage from './Screens/SearchIngredientsPage';
import ScanIngredientsPage from './Screens/ScanIngredientsPage';
import HomePage from './Screens/HomePage';
import { REACT_APP_AD_MOB_PUBLISHER_ID } from 'react-native-dotenv';
import { AdsConsent, AdsConsentStatus } from '@react-native-firebase/admob';
import SplashScreen from 'react-native-splash-screen';
import DeviceInfo from 'react-native-device-info';
import { REACT_APP_GOOGLE_PLAY_LINK, REACT_APP_FORCE_UPDATE } from 'react-native-dotenv';
import { setDataAsync } from './API/Storage';
import { isMostRecentVersionAsync } from './API/APIFunctions';
import RNRestart from 'react-native-restart'; 
import NetInfo from "@react-native-community/netinfo";

export default function App() {

  const [page, setPage] = useState("HomePage");

  const [adConsentStatus, setAdConsentStatus] = useState(null);

  useEffect(() => {
    const assertInternetConnectionAsync = async()=>{
      NetInfo.fetch().then(state => {
        if (!state.isConnected) {
          Alert.alert(
            'No Internet Connection',
            'Foodi requires an internet connection to function. Please check your connection and try again.',
            [
              { text: 'Retry', onPress: () => RNRestart.Restart()},
            ],
            { cancelable: false },
          );
        }
  
      });
    }
    const getAdConsentAsync = async () => {
      const consentInfo = await AdsConsent.requestInfoUpdate([REACT_APP_AD_MOB_PUBLISHER_ID]);
      console.log("consent info", consentInfo);
      if (
        consentInfo.isRequestLocationInEeaOrUnknown &&
        consentInfo.status === AdsConsentStatus.UNKNOWN
      ) {
        const formResult = await AdsConsent.showForm({
          privacyPolicy: 'https://sites.google.com/view/saltynerd-appstudio/home/privacy-policy',
          withPersonalizedAds: true,
          withNonPersonalizedAds: true,
          withAdFree: false,
        });
        const status = formResult.status;
        setAdConsentStatus(status);
      }
    }

    const assertUpdateAsync = async () => {
      if (REACT_APP_FORCE_UPDATE === "TRUE" && !await isMostRecentVersionAsync(DeviceInfo.getVersion())) {
        Alert.alert(
          'New Update Available',
          'Update Foodi from the Google Play store for new exciting features!',
          [
            { text: 'Update', onPress: () => Linking.openURL(REACT_APP_GOOGLE_PLAY_LINK) },
          ],
          { cancelable: false },
        );
      }
    };

    const main = async () => {

      if (!__DEV__) {
        console.log = () => { };
      }
      await assertInternetConnectionAsync();
      await setDataAsync("lastPage", JSON.stringify(-1))
      await setDataAsync("currentPage", JSON.stringify(0))
      await getAdConsentAsync();
      await assertUpdateAsync();
      SplashScreen.hide();
    }

    main();
  }, []);



  var content = null;

  if (page == "ScanIngredientsPage") {
    content = <ScanIngredientsPage adConsentStatus={adConsentStatus} setPage={setPage} />;
  }
  else if (page == "HomePage") {
    content = <HomePage setPage={setPage} />;
  }
  else if (page == "SearchIngredientsPage") {
    content = <SearchIngredientsPage adConsentStatus={adConsentStatus} setPage={setPage} />;
  }
  return (
    content
  );
}
