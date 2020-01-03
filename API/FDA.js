import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv';
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv';
const nlp = require('compromise');

export const getFDAFilteredWordListAsync = async (wordList = [], getRemovedItems = false) => {
    try {
        const parsedInput = wordList.reduce((a, b, i) => ((i == 0) ? b.toLowerCase() : a + ',' + b.toLowerCase()), "");
        //console.log("parsed input fda", parsedInput);
        const response = await fetch(REACT_APP_FDA_API_URL + REACT_APP_FDA_API_KEY, {
            body: JSON.stringify({
                "generalSearchInput": parsedInput,
                "includeDataTypeList": ["Foundation", "SR Legacy"],
                "requireAllWords": "false",

            }),
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST"
        })
        const responseJson = await response.json();
        const food_obj_arr = responseJson["foods"];
        let food_description_words = [];
        food_obj_arr.forEach(obj => {
            const phrases = obj["description"].toLowerCase().split(",").map(x => x.trim());
            food_description_words = [...food_description_words,
            ...phrases,
            ...phrases.map(x => {
                let noun = nlp(x).nouns().toSingular().out();
                return ((x.split(" ").pop() == noun) ? noun : "");
            }).filter(x => x != ""),
            ];
        });
        //console.log("food_description_words", food_description_words);
        //console.log("input list:", wordList);

        const filtered_lst = wordList.filter(x => {
            //console.log("x:", x);
            const noun_in_ingredient = nlp(x.toLowerCase()).nouns().toSingular().out();
            //console.log("noun in x", noun_in_ingredient);
            if (!x.includes(" ")) // ingredient name does not contain multiple words
                return food_description_words.includes(noun_in_ingredient);
            else { //make sure the noun is the last word in the ingredient
                const ingredient_words = x.split(" ").map(x => x.toLowerCase());
                return (ingredient_words.pop().includes(noun_in_ingredient) && food_description_words.includes(noun_in_ingredient));
            }
        });
        //console.log("filtered lst", filtered_lst);
        const removed_items_lst = wordList.filter(x => !filtered_lst.includes(x));
        return (getRemovedItems) ? [filtered_lst, removed_items_lst] : filtered_lst;
    } catch (error) {
        console.log(error);
        return (getRemovedItems) ? [[], []] : [];
    }
}