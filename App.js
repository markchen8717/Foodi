import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import SearchIngredientsPage from './Screens/SearchIngredientsPage';
import ScanIngredientsPage from './Screens/ScanIngredientsPage';
import HomePage from './Screens/HomePage';
import { REACT_APP_AD_MOB_PUBLISHER_ID } from 'react-native-dotenv';
import { AdsConsent, AdsConsentStatus } from '@react-native-firebase/admob';



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
          privacyPolicy: 'https://invertase.io/privacy-policy',
          withPersonalizedAds: true,
          withNonPersonalizedAds: true,
          withAdFree: false,
        });
        const status = formResult.status;
        setAdConsentStatus(status);
      }
    }
    if (page === "ScanIngredientsPage" || page === "SearchIngredientsPage")
      getAdConsentAsync();
  }, [page]);



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
