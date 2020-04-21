import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv';
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv';
import HashTable from '../Data_Structures/HashTable.js';
const nlp = require('compromise');

export const getFDAFilteredWordListAsync = async (wordList = [], getRemovedItems = false) => {
    try {
        console.log("in fda");
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

        console.log("processing in fda");
        let food_description_words = new HashTable(200);
        responseJson["foods"].forEach(food => {
            const phrases_arr = food["description"].toLowerCase().split(",");
            phrases_arr.forEach(phrase => {
                // nlp(phrase).nouns().toPlural().out('array').forEach(noun => {
                //     food_description_words.push(noun);
                // })
                food_description_words.push(phrase);
            });
        });

        console.log("description words", food_description_words.storage);
        let filtered_lst = [];
        let removed_items_lst = [];
        wordList.forEach(x => {
            if (food_description_words.includes(nlp(x).nouns().toPlural().out().toLowerCase()) ||
                food_description_words.includes(nlp(x).nouns().toSingular().out().toLowerCase()) ||
                food_description_words.includes(x))
                filtered_lst.push(x);
            else
                removed_items_lst.push(x);
        })
        console.log("leaving fda");
        return (getRemovedItems) ? [filtered_lst, removed_items_lst] : filtered_lst;
    } catch (error) {
        console.log("getFDAFilteredWordListAsync", error);
        return (getRemovedItems) ? [[], []] : [];
    }
}