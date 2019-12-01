import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import IngredientsPage from './Screens/IngredientsPage';
import CameraPage from './Screens/CameraPage';
import { REACT_APP_OCR_API_KEY } from 'react-native-dotenv'

var ingrdnts_to_description_sample_data = [
  { 'Soy Sauce': 'A Chinese sauce' },
  { 'Ponzu': 'Lemon juice + Soy Sauce' }
];



export default function App() {

  const [page, setPage] = useState("CameraPage");
  const [ingrdnts, setIngrdnts] = useState();

  toIngredientsPage = (ingrdnts) => {
    setIngrdnts(ingrdnts);
    setPage("IngredientsPage");
  };

  var content = null;
  //Once picture is taken render ingredients page
  if (page == "IngredientsPage") {
    content = <IngredientsPage ingrdnts={ingrdnts} />;
  }
  else if (page == "CameraPage") {
    content = <CameraPage toIngredientsPage={toIngredientsPage} />;
  }
  return (
    content
  );
}
