import {
    REACT_APP_COOKBOOK_API_URL,
    REACT_APP_WIKI_QUERY_URL,
    REACT_APP_WIKI_SEARCH_URL,
    REACT_APP_WIKI_SECTION_QUERY_URL,
    REACT_APP_WIKI_SECTION_PARSE_URL,
} from 'react-native-dotenv';

const cheerio = require('cheerio')


const getTruncatedText = (text = "", len = 0) => {
    const truncated = text.slice(0, text.lastIndexOf('.', len) + 1);
    const frst_sen = text.slice(0, text.indexOf('.') + 1);
    if (truncated.length > frst_sen.length)
        return truncated;
    else
        return frst_sen;
}

const getProcessedURL = (url = "") => {
    return ((url.includes("http")) ? url : "https:" + url);
}

export const getIngredientSearchResultsAsync = async (ingredient="") => {
    try {
        const responseJson = await (await fetch(REACT_APP_WIKI_SEARCH_URL + ingredient)).json();
        if(Array.isArray(responseJson) && responseJson.length>=2)
            return responseJson[1];
        else
            return [];
    } catch (error) {
        console.log("getIngredientSearchResultsAsync",error);
        return [];
    }
}

export const getIngredientDescriptionFromWikiAsync = async (ingredient) => {
    try {
        const response = await fetch(REACT_APP_WIKI_QUERY_URL + ingredient.toLowerCase());
        const responseJson = await response.json()
        const pages_obj = responseJson["query"]["pages"];
        const page_id = Object.keys(pages_obj)[0];
        const page_id_obj = pages_obj[page_id];
        const page_url = getProcessedURL(page_id_obj["fullurl"]);
        if (page_id == "-1" || page_url.includes("disambiguation"))
            return null;
        let img_url = null;
        try {
            img_url = page_id_obj["thumbnail"]["source"];
            img_url = getProcessedURL(img_url);
        } catch{
            img_url = null;
        }
        const ingredientUsageText = await getIngredientUsageAsync(ingredient);
        let text = (ingredientUsageText != null) ? ingredientUsageText : page_id_obj["extract"].replace("\n", " ").trim();
        text = getTruncatedText(text, 250);
        if(text == "")
            return null;
        return { "text": text, "visual": img_url, "page_url": page_url };
    } catch (error) {
        console.log("getIngredientDescriptionFromWikiAsync",error);
        return null;
    }
}

export const getIngredientUsageAsync = async (ingredient) => {
    try {
        const parsedInput = ingredient.toLowerCase().trim().replace(" ", "_");
        const response = await fetch(REACT_APP_WIKI_SECTION_QUERY_URL + parsedInput);
        const responseJson = await response.json();
        const sections = responseJson["parse"]["sections"];
        let section_id = null;
        let section_title = null;
        for (let i = 0; i < sections.length; i++) {
            const section_title_words = sections[i]["line"].split(" ").map(x => x.trim());
            if (section_title_words.includes("Use") || section_title_words.includes("Uses")) {
                section_id = sections[i]["index"];
                section_title = sections[i]["line"];
                break;
            }
        }
        const sectionParseResponse = await fetch(REACT_APP_WIKI_SECTION_PARSE_URL + parsedInput + "&section=" + section_id)
        const sectionParseResponseJson = await sectionParseResponse.json();
        const html = sectionParseResponseJson["parse"]["text"]["*"];
        return cheerio.load(html).text().replace(section_title + "[edit]", "").replace("\n", " ").trim();
    } catch (error) {
        console.log("getIngredientUsageAsync",error);
        return null;
    }
}

export const getIngredientDescriptionFromCookbookAsync = async (ingredient) => {
    try {
        const response = await fetch(REACT_APP_COOKBOOK_API_URL + ingredient);
        const responseJson = await response.json()
        const pages_obj = responseJson["query"]["pages"];
        const page_id = Object.keys(pages_obj)[0];
        const page_id_obj = pages_obj[page_id];
        const page_url = getProcessedURL(page_id_obj["fullurl"]);
        if (page_id === "-1" || page_url.includes("disambiguation"))
            return null;
        const img_arr = (Object.keys(page_id_obj).includes("images")) ? page_id_obj["images"] : null;
        let img_url = null;
        for (let i = 0; i < ((img_arr !== null) ? img_arr.length : 0); i++) {
            let img_title = img_arr[i]["title"];
            if (img_title.includes(".jpg")) {
                const response2 = await fetch(REACT_APP_WIKI_QUERY_URL + img_title);
                const response2Json = await response2.json();
                const page_id2 = Object.keys(response2Json["query"]["pages"])[0];
                try {
                    img_url = response2Json["query"]["pages"][page_id2]["thumbnail"]["source"];
                } catch{
                    img_url = null;
                }
                img_url = getProcessedURL(img_url);
                break;
            }
        }
        let text = page_id_obj["extract"];
        text = text.slice(text.indexOf("\n", text.lastIndexOf("|"))).replace("\n", " ").trim();
        return { "text": getTruncatedText(text, 250), "visual": img_url, "page_url": page_url };
    } catch (error) {
        console.log("getIngredientDescriptionFromCookbookAsync",error);
        return null;
    }
}
