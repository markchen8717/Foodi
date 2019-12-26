import { REACT_APP_COOKBOOK_API_URL } from 'react-native-dotenv';
import { REACT_APP_WIKI_QUERY_URL } from 'react-native-dotenv';
import { REACT_APP_WIKI_SEARCH_URL } from 'react-native-dotenv';

const getTruncatedText = (text, len) => {
    const truncated = text.slice(0, text.lastIndexOf('.', len) + 1);
    const frst_sen = text.slice(0, text.indexOf('.') + 1);
    if (truncated > frst_sen)
        return truncated;
    else
        return frst_sen;
}

const getProcessedURL = (url = null) => {
    if (url === null)
        return null;
    else
        return ((url.includes("http")) ? url : "https:" + url);
}

export const getIngredientSearchResultsAsync = async (ingredient) =>{
    const responseJson = await (await fetch(REACT_APP_WIKI_SEARCH_URL + ingredient)).json();
    return (responseJson[1]);
}

export const getIngredientDescriptionFromWikiAsync = async (ingredient) => {
    try {
        //console.log("getIngredientDescriptionFromWiki");
        const response = await fetch(REACT_APP_WIKI_QUERY_URL + ingredient.toLowerCase());
        const responseJson = await response.json()
        const pages_obj = responseJson["query"]["pages"];
        const page_id = Object.keys(pages_obj)[0];
        const page_url = getProcessedURL(pages_obj[page_id]["fullurl"]);
        if (page_id == "-1" || page_url.includes("disambiguation"))
            return null;
        const img_url = getProcessedURL(pages_obj[page_id]["thumbnail"]["source"]);
        const text = pages_obj[page_id]["extract"].replace("\n", " ");
        return { "text": getTruncatedText(text, 250), "visual": img_url, "page_url": page_url };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getIngredientDescriptionFromCookbookAsync = async (ingredient) => {
    try {
        //console.log("getIngredientDescriptionFromCookbook");
        const response = await fetch(REACT_APP_COOKBOOK_API_URL + ingredient);
        const responseJson = await response.json()
        //console.log(responseJson);
        const pages_obj = responseJson["query"]["pages"];
        //console.log(pages_obj);
        const page_id = Object.keys(pages_obj)[0];
        const page_url = getProcessedURL(pages_obj[page_id]["fullurl"]);
        if (page_id === "-1" || page_url.includes("disambiguation"))
            return null;
        const img_arr = pages_obj[page_id]["images"];
        const page_title = pages_obj[page_id]["title"].replace("Cookbook:","");
        let img_url = null;
        for (let i = 0; i < ((img_arr !== null) ? img_arr.length : 0); i++) {
            let img_title = img_arr[i]["title"];
            if (img_title.includes(".jpg")) {
                const response2 = await fetch(REACT_APP_WIKI_QUERY_URL + img_title);
                const response2Json = await response2.json();
                const page_id2 = Object.keys(response2Json["query"]["pages"])[0];
                img_url = getProcessedURL(response2Json["query"]["pages"][page_id2]["thumbnail"]["source"]);
                break;
            }
        }
        let text = pages_obj[page_id]["extract"];
        text = text.slice(text.indexOf("\n",text.lastIndexOf("|"))).replace("\n"," ").trim();
        return { "text": getTruncatedText(text, 250), "visual": img_url, "page_url": page_url };
    } catch (error) {
        console.error(error);
        return null;
    }
}
