import { REACT_APP_OCR_API_KEY } from 'react-native-dotenv';
import { REACT_APP_OCR_API_URL } from 'react-native-dotenv';
import {isIngredientInFDAAsync} from '../API/FDA'

export const getIngredientsFromImageAsync = async (image) => {
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

        const word_lst = responseJson["ParsedResults"][0]["ParsedText"].replace(/\r?\n/g, ",").split(",");

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
                filtered_word = filtered_word.slice(1);
                // console.log(filtered_word);
                if (await isIngredientInFDAAsync(filtered_word))
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