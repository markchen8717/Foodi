import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import IngredientsPage from './Screens/IngredientsPage';
import CameraPage from './Screens/CameraPage';
import cheerio from 'cheerio-without-node-native'
import { REACT_APP_OCR_API_KEY } from 'react-native-dotenv'
import { REACT_APP_OCR_API_URL } from 'react-native-dotenv'
import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv'
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv'
import { REACT_APP_WIKI_API_URL } from 'react-native-dotenv'

var sample_data = [
  {'name': 'Soy Sauce', 'text': 'A Chinese sauce', 'visual': null }
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
      //console.log(responseJson);

      let ingrdnts_lst = responseJson["ParsedResults"][0]["ParsedText"].replace(/\r?\n/g, ",").split(",");

      //filter
      let filtered_lst = [];
      for (let i = 0; i < ingrdnts_lst.length; i++) {
        let el = ingrdnts_lst[i] = ingrdnts_lst[i].toLowerCase();
        var letters = /^[a-zA-Z\s]*$/;
        if (el != "" && el.length > 1 && letters.test(el) && ingrdnts_lst.indexOf(el) == i) {
          let formatted = ""
          let words = el.split(" ");
          words.forEach(x => {
            formatted += " " + x[0].toUpperCase() + x.slice(1);
          });
          filtered_lst.push(formatted.slice(1));
        }
      }

      console.log("filtered list", filtered_lst);
      return filtered_lst;
    }
    catch (error) {
      console.error(error);
    }
  }

  getIngredientDescription = async (ingredient) => {
    try {
      console.log("getIngredientDescription");
      let response = await fetch(REACT_APP_WIKI_API_URL + ingredient.replace(" ", "_"));
      let responseText = await response.text();
      let a = responseText.lastIndexOf("<p>",responseText.toLowerCase().indexOf("<b>" + ingredient.toLowerCase().slice(0, ingredient.lenth - 1)));
      let b = responseText.indexOf("</p>",a);
      if (a < b){
        let p = responseText.lastIndexOf("src=",responseText.indexOf("thumbimage"))+5;
        let q = responseText.indexOf('"',p);
        return { "text": cheerio(responseText.slice(a, b)).text(), "visual": "https:"+responseText.slice(p,q) };
      }else
        return null;
    }
    catch (error) {
      console.error(error);
    }
  }

  toIngredientsPage = async (image) => {

    let ingrdnts_lst = await getIngredientsFromImage(image);

    let final_product = [];
    for (let i = 0; i < ingrdnts_lst.length; i++) {
      let name = ingrdnts_lst[i];
      let dscrption = await getIngredientDescription(name);
      if (dscrption != null) {
        final_product.push({"name":name,"text":dscrption["text"],"visual":dscrption["visual"]});
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
