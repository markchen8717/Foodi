import { REACT_APP_UPC_SEARCH_URL } from 'react-native-dotenv';

export const isIngredientInUPC = async (ingredient) =>{
    const response = await fetch(REACT_APP_UPC_SEARCH_URL + ingredient.toLowerCase().replace(" ","-"));
    
    const responseText = await response.text();
    return !responseText.includes("Error 404");
    
}