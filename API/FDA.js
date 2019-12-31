import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv';
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv';


export const getFDAFilteredWordListAsync = async (wordList=[],getRemovedItems = false) => {
    try {
        const parsedInput = wordList.reduce((a,b,i)=>((i == 0)? b.toLowerCase() : a+','+b.toLowerCase()),"");
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
            food_description_words = [...food_description_words, ...obj["description"].toLowerCase().split(",").map(x=>x.trim())];
        });
        const filtered_lst = wordList.filter(x=>food_description_words.includes(x.toLowerCase()));
        const removed_items_lst = wordList.filter(x=>!filtered_lst.includes(x));
        return (getRemovedItems)? [filtered_lst,removed_items_lst]:filtered_lst;
    } catch (error) {
        console.log(error);
        return [];
    }
}