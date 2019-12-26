import { REACT_APP_FDA_API_KEY } from 'react-native-dotenv';
import { REACT_APP_FDA_API_URL } from 'react-native-dotenv';

export const isIngredientInFDAAsync = async (ingredient) => {
    //console.log("checking FDA");
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

        for (let i = 0; i < Math.min(20, food_obj.length); i++) {
            const description_words = food_obj[i]["description"].toLowerCase().split(",");
            for (let j = 0; j < description_words.length; j++) {
                if (description_words[j].toLowerCase().trim() == ingredient.toLowerCase())
                    return true;
            }
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}