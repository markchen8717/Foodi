import { REACT_APP_UPC_SEARCH_URL } from 'react-native-dotenv';

export const isIngredientInUPCAsync = async (ingredient) => {
    try {
        const response = await fetch(REACT_APP_UPC_SEARCH_URL + ingredient.toLowerCase().replace(" ", "-"));
        const responseText = await response.text();
        return !responseText.includes("Error 404");
    } catch (error) {
        console.log(error);
        return false;
    }

}