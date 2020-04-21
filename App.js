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
const cheerio = require('cheerio')



export default function App() {

  const [page, setPage] = useState("HomePage");

  const [adConsentStatus, setAdConsentStatus] = useState(null);

  useEffect(() => {
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

    const checkUpdateAsync = async () => {
      const response = await fetch(REACT_APP_GOOGLE_PLAY_LINK);
      const responseText = await response.text();
      const parsedText = cheerio.load(responseText).text();

      //console.log(parsedText);
      const a = parsedText.lastIndexOf("Current Version");
      const b = parsedText.indexOf("R", a);
      const latestVersionString = parsedText.substring(a, b).replace("Current Version", "");
      const currentVersionString =  DeviceInfo.getVersion();
      const lastestVersionParsedInt = parseInt(latestVersionString.replace(/\./g,""));
      const currentVersionParsedInt =  parseInt(currentVersionString.replace(/\./g,""));
      console.log("lastest version:",latestVersionString, "parsedInt:",lastestVersionParsedInt);
      console.log("current version:", currentVersionString, "current version parsedInt:",currentVersionParsedInt);
      if (REACT_APP_FORCE_UPDATE === "TRUE" &&  lastestVersionParsedInt >currentVersionParsedInt) {
        Alert.alert(
          'New Update Available',
          'Update Foodi from the Google Play store now!',
          [
            { text: 'Update', onPress: () => Linking.openURL(REACT_APP_GOOGLE_PLAY_LINK) },
          ],
          { cancelable: false },
        );

      }
      else
        SplashScreen.hide();
    };

    checkUpdateAsync();
    getAdConsentAsync();

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
