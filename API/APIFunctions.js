import { REACT_APP_BACKEND_API_URI, REACT_APP_BACKEND_API_BATCH_SEARCH_ROUTE, REACT_APP_BACKEND_API_SINGLE_FUZZY_SEARCH_ROUTE } from 'react-native-dotenv';

export const getIngredientFuzzySearchResultAsync = async (ingredient, abortController = new AbortController()) => {
  try {
    
    const response = await fetch(REACT_APP_BACKEND_API_URI + REACT_APP_BACKEND_API_SINGLE_FUZZY_SEARCH_ROUTE, {
      signal: abortController.signal,
      body: JSON.stringify({
        "ingredientToSearch": ingredient
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const responseJson = await response.json();
    // console.log("getIngredientFuzzySearchResult", responseJson);
    if (responseJson.status != "200") {
      throw ("Failed request");
    }
    return responseJson.ingredientsFound.map((x) => x.data);

  } catch (error) {
    return [];
  }
}

export const getBatchIngredientSearchResultAsync = async (ingredientsToSearch = [], abortController = new AbortController()) => {
  try {
    const response = await fetch(REACT_APP_BACKEND_API_URI + REACT_APP_BACKEND_API_BATCH_SEARCH_ROUTE, {
      signal: abortController.signal,
      body: JSON.stringify({
        "ingredientsToSearch": ingredientsToSearch,
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const responseJson = await response.json();
    // console.log("getBatchIngredientSearchResult", responseJson);
    if (responseJson.status != "200") {
      throw ("Failed request");
    }
    return responseJson.ingredientsFound.map((x) => x.data);

  } catch (error) {
    return [];
  }
}

