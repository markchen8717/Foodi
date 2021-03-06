import { REACT_APP_OFF_PRODUCT_QUERY_URL } from 'react-native-dotenv';


export const getIngredientsListFromBarcodeAsync = async (barcode = "",abortController=new AbortController()) => {
    try {
        const responseJson = await (await fetch(REACT_APP_OFF_PRODUCT_QUERY_URL + barcode + ".json",{signal:abortController.signal})).json();
        const ingredientsObj = responseJson["product"]["ingredients"];
        let ingredientsList = [];
        ingredientsObj.forEach((obj) => {
            try {
                const ingredient = obj["id"].slice(3); //get rid of language identifier prefix
                ingredientsList.push(ingredient);
                if (Object.keys(obj).includes("origin")) { // handles sub ingredients ex. x(y,z)
                    ingredientsList = [...ingredientsList, ...obj["origin"].split(",").map(x => x.trim())];
                }
            } catch (error) {
                console.log(error);
            }
        })
        return ingredientsList;

    } catch (error) {
        console.log("getIngredientsListFromBarcodeAsync", error);
        return [];
    }

}