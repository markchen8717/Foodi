import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import IngredientsPage from './Screens/IngredientsPage';
import CameraPage from './Screens/CameraPage';
import { REACT_APP_OCR_API_KEY } from 'react-native-dotenv'
import { REACT_APP_OCR_API_URL } from 'react-native-dotenv'
import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv'
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv'
import { REACT_APP_WIKI_API_URL } from 'react-native-dotenv'

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
      console.log(responseJson);

      let ingrdnts_lst = responseJson["ParsedResults"][0]["ParsedText"].replace(/\r?\n/g, " ").split(" ");

      //filter
      ingrdnts_lst = ingrdnts_lst.filter(function (el,index) {
        var letters = /^[A-Za-z]+$/;
        return el != "" && el.length > 1 && letters.test(el.value) && ingrdnts_lst.indexOf(el)===index;
      });

      return ingrdnts_lst;
    }
    catch (error) {
      console.error(error);
    }
  }

  getIngredientDescription = async (ingredient) => {
    try {
      let response = await fetch(REACT_APP_WIKI_API_URL + ingredient);
      let responseJson = await response.json();
      if (responseJson.length >= 2 &&
        responseJson[1].length >= 1 &&
        responseJson[1][0].toLowerCase() === ingredient.toLowerCase() &&
        !responseJson[2][0] == "" &&
        !responseJson[2][0].includes("refer to:")) {
        return responseJson[2][0];
      } else {
        return -1;
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  toIngredientsPage = async (image) => {
    let ingrdnts_lst = await getIngredientsFromImage(image);
    let final_product = [];
    for (let i = 0; i < ingrdnts_lst.length; i++) {
      let tmp_obj = {};
      let value = await getIngredientDescription(ingrdnts_lst[i]);
      if (value != -1) {
        tmp_obj[ingrdnts_lst[i]] = value;
        final_product.push(tmp_obj);
      }
    }
    setIngredientsToDescription(final_product);
    setPage("IngredientsPage");
  };

  var content = null;
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
