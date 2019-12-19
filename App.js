import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import IngredientsPage from './Screens/IngredientsPage';
import CameraPage from './Screens/CameraPage';
import { REACT_APP_OCR_API_KEY } from 'react-native-dotenv'
import { REACT_APP_OCR_API_URL } from 'react-native-dotenv'

var sample_data = [
  { 'Soy Sauce': 'A Chinese sauce' },
  { 'Ponzu': 'Lemon juice + Soy Sauce' }
];


export default function App() {

  const [page, setPage] = useState("CameraPage");
  const [ingrdnts_to_dscrption, setIngredientsToDescription] = useState();

  getIngredientsFromImage = async (image) => {
    console.log("scanning............");
    try {
      let postBody = new FormData();
      postBody.append("base64Image", "data:image/jpeg;base64," + image.base64);
      postBody.append("detectOrientation", "true");
      let response = await fetch(REACT_APP_OCR_API_URL, {
        method: 'POST',
        headers: {
          'apikey': REACT_APP_OCR_API_KEY,
        },
        body: postBody
      });

      let responseJson = await response.json();
      let ingrdnts_lst = responseJson["ParsedResults"][0]["ParsedText"].replace("\n", "").split(" ");
      // ingrdnts_lst.forEach(element => {
      //   console.log(element);
      // });
      return ingrdnts_lst;

      //filter usless ingredients
    }
    catch (error) {
      console.error(error);
    }
  }

  getIngredientDescription = (ingredient) => {

  }

  toIngredientsPage = async (image) => {
    let ingrdnts_lst = await getIngredientsFromImage(image);


    let final_product = [];
    ingrdnts_lst.forEach((key) => {
      let tmp_obj = {};
      tmp_obj[key] = "info";
      final_product.push(tmp_obj);
    });
    console.log(final_product);
    console.log(sample_data);
    setIngredientsToDescription(final_product);
    setPage("IngredientsPage");
  };

  var content = null;
  //Once picture is taken render ingredients page
  if (page == "IngredientsPage") {
    content = <IngredientsPage ingrdnts_to_dscrption={ingrdnts_to_dscrption} />;
  }
  else if (page == "CameraPage") {
    content = <CameraPage toIngredientsPage={toIngredientsPage} />;
  }
  return (
    content
  );
}
