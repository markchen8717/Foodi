import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv';
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv';
const nlp = require('compromise');

export const getFDAFilteredWordListAsync = async (wordList = [], getRemovedItems = false) => {
    try {
        const parsedInput = wordList.reduce((a, b, i) => ((i == 0) ? b.toLowerCase() : a + ',' + b.toLowerCase()), "");
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
        const food_description_words = responseJson["foods"].reduce((a, obj) => {
            const phrases_arr = obj["description"].toLowerCase().split(",");
            const nouns = phrases_arr.reduce((a, c) => ([...a,
            ...nlp(c).nouns().toSingular().out('array'),
            ...nlp(c).nouns().toPlural().out('array')]), []);
            return [...a, 
                //...phrases_arr,
                ...nouns];
        }, []);
        console.log("description words:",food_description_words);
        const filtered_lst = wordList.filter(x => food_description_words.includes(nlp(x).nouns().out().toLowerCase()));
        const removed_items_lst = wordList.filter(x => !filtered_lst.includes(x));
        return (getRemovedItems) ? [filtered_lst, removed_items_lst] : filtered_lst;
    } catch (error) {
        console.log("getFDAFilteredWordListAsync", error);
        return (getRemovedItems) ? [[], []] : [];
    }
}