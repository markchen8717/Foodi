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
            const phrases_arr = obj["description"].toLowerCase().split(",").map(x => x.trim());
            const singular_nouns = phrases_arr.map(x=>nlp(x).nouns().toSingular().out('array')).filter(x=>x!=[""]);
            const plural_nouns = phrases_arr.map(x=>nlp(x).nouns().toPlural().out('array')).filter(x=>x!=[""]);
            food_description_words = [...food_description_words,
            ...phrases_arr,
            ...singular_nouns.reduce((a,c,i)=>([...a,...c]),[]),
            ...plural_nouns.reduce((a,c,i)=>([...a,...c]),[]),
            ];
        });
        //console.log("food_description_words", food_description_words);
        //console.log("input list:", wordList);

        const filtered_lst = wordList.filter(x => food_description_words.includes(x));
        //console.log("filtered lst", filtered_lst);
        const removed_items_lst = wordList.filter(x => !filtered_lst.includes(x));
        return (getRemovedItems) ? [filtered_lst, removed_items_lst] : filtered_lst;
    } catch (error) {
        console.log("getFDAFilteredWordListAsync", error);
        return (getRemovedItems) ? [[], []] : [];
    }
}