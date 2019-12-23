import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import IngredientsPage from './Screens/IngredientsPage';
import CameraPage from './Screens/CameraPage';
import cheerio from 'cheerio-without-node-native'
import { REACT_APP_OCR_API_KEY } from 'react-native-dotenv'
import { REACT_APP_OCR_API_URL } from 'react-native-dotenv'
import { REACT_APP_COOKBOOK_API_URL } from 'react-native-dotenv'
import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv'
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv'
import { REACT_APP_WIKI_URL } from 'react-native-dotenv'

var pluralize = require('pluralize')

var sample_data = [
  { 'name': 'Soy Sauce', 'text': 'A Chinese sauce', 'visual': "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg", 'page_url': "https://google.ca" },

];


export default function App() {

  const [page, setPage] = useState("CameraPage");
  const [ingrdnts_to_dscrption, setIngredientsToDescription] = useState(sample_data);

  getIngredientsFromImage = async (image) => {
    console.log("scanning............");
    try {
      let postBody = new FormData();
      postBody.append("base64Image", "data:image/jpeg;base64," + image.base64);
      postBody.append("detectOrientation", "true");
      const response = await fetch(REACT_APP_OCR_API_URL, {
        method: 'POST',
        headers: {
          'apikey': REACT_APP_OCR_API_KEY,
        },
        body: postBody
      });
      const responseJson = await response.json();
      //console.log(responseJson);

      const word_lst = [" SKIM MILK"];

      console.log("word list", word_lst);
      /*
      filter
        -ingredient not in FDA
        -leading and trailing spaces
        -letters only
        -empty strings
        -strings of length 1
        -duplicates
        -for valid strings:
          -Capitalize the first letter of each word
            -Account for ingredients with multiple words
      */
      let filtered_lst = [];
      for (let i = 0; i < word_lst.length; i++) {
        let filtered_word = word_lst[i];
        const letters = /^[a-zA-Z\s]*$/;
        if (filtered_word != "" && filtered_word.length > 1 && letters.test(filtered_word) && word_lst.indexOf(filtered_word) == i) {
          // console.log("filtered_word",filtered_word);
          filtered_word = filtered_word.toLowerCase().trim();
          let words = filtered_word.split(" ");
          filtered_word = "";
          words.forEach(x => {
            filtered_word += " " + x[0].toUpperCase() + x.slice(1);
          });
          filtered_word = pluralize.singular(filtered_word.slice(1));
          // console.log(filtered_word);
          if (await isIngredientInFDA(filtered_word))
            filtered_lst.push(filtered_word);
        }
      }
      console.log("filtered list", filtered_lst);
      return filtered_lst;
    }
    catch (error) {
      console.error(error);
    }
  }

  getIngredientDescriptionFromCookbook = async (ingredient) => {
    try {
      console.log("getIngredientDescriptionFromCookbook");
      const srch_url = REACT_APP_COOKBOOK_API_URL + ingredient.replace(" ", "_");
      const response = await fetch(srch_url);
      const responseText = await response.text();
      const a = responseText.lastIndexOf("<p>", responseText.toLowerCase().indexOf("<b>" + ingredient.toLowerCase().slice(0, ingredient.length - 1)));
      const b = responseText.indexOf("</p>", a);
      const txt = getTruncatedText(cheerio(responseText.slice(a, b)).text(),300);
      if (a != -1 && b != -1 && a < b) {
        const p = responseText.lastIndexOf("src=", responseText.indexOf("thumbimage")) + 5;
        const q = responseText.indexOf('"', p);
        const pre_processed_visual_url = (p != -1 && q != -1 && p < q)? responseText.slice(p,q) : null;
        const visual_url = getProcessedURL(pre_processed_visual_url);
        return { "text": txt, "visual": visual_url, "page_url": srch_url };
      } else { return null; }
    }
    catch (error) {
      console.error(error);
      return null;
    }
  }

  isIngredientInFDA = async (ingredient) => {
    console.log("checking FDA");
    try {
      const response = await fetch(REACT_APP_FDA_API_URL + REACT_APP_FDA_API_KEY, {
        body: JSON.stringify({
          "generalSearchInput": ingredient.toLowerCase(),
          "includeDataTypeList": ["Foundation", "SR Legacy"],
          "requireAllWords": "true",
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })
      const responseJson = await response.json();
      //console.log(responseJson);
      const food_obj = responseJson["foods"];
      //console.log(food_obj);

      for(let i = 0 ; i < Math.min(20,food_obj.length) ; i++)
      {
        const description_words = food_obj[i]["description"].toLowerCase().split(",");
        for (let j = 0; j < description_words.length ; j++)
        {
          if(description_words[j].toLowerCase().trim() == ingredient.toLowerCase()) 
            return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  getTruncatedText = (text, len) => {
    const truncated = text.slice(0, text.lastIndexOf('.', len) + 1);
    const frst_sen = text.slice(0, text.indexOf('.') + 1);
    if (truncated > frst_sen)
      return truncated;
    else
      return frst_sen;
  }

  getProcessedURL = (url) =>{
    if(url === null )
      return null;
    else
      return (url.includes("http"))? url:"https:"+url;
  }

  getIngredientDescriptionFromWiki = async (ingredient) => {
    try {
      console.log("getIngredientDescriptionFromWiki");
      const response = await fetch(REACT_APP_WIKI_URL + ingredient.toLowerCase());
      const responseJson = await response.json()
      const pages_obj = responseJson["query"]["pages"];
      const page_id = Object.keys(pages_obj)[0];
      const page_url = getProcessedURL(pages_obj[page_id]["fullurl"]);
      if (page_id == "-1" || page_url.includes("disambiguation"))
        return null;
      const img_url = getProcessedURL(pages_obj[page_id]["thumbnail"]["source"]);
      const text = pages_obj[page_id]["extract"];
      return { "text": getTruncatedText(text, 300), "visual": img_url, "page_url": page_url };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  toIngredientsPage = async (image) => {
    const ingrdnts_lst = await getIngredientsFromImage(image);

    let ingredients_to_description = [];
    for (let i = 0; i < ingrdnts_lst.length; i++) {
      const name = ingrdnts_lst[i];
      const cookbook_dscrption = await getIngredientDescriptionFromCookbook(name);
      const dscrption = (cookbook_dscrption != null) ? cookbook_dscrption : await getIngredientDescriptionFromWiki(name);
      if (dscrption != null) {
        ingredients_to_description.push({ "name": name, "text": dscrption["text"], "visual": dscrption["visual"], "page_url": dscrption["page_url"] });
      }
    }
    setIngredientsToDescription(ingredients_to_description);
    //console.log(ingredients_to_description)
    setPage("IngredientsPage");
  };


  var content = null;
  if (page == "IngredientsPage") {
    content = <IngredientsPage toHomePage={setPage} ingrdnts_to_dscrption={ingrdnts_to_dscrption} />;
  }
  else if (page == "CameraPage") {
    content = <CameraPage toIngredientsPage={toIngredientsPage} />;
  }
  else if (page == "HomePage") {
    content = <Text>Home page</Text>;
  }
  return (
    content
  );
}
