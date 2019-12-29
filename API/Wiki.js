import {
    REACT_APP_COOKBOOK_API_URL,
    REACT_APP_WIKI_QUERY_URL,
    REACT_APP_WIKI_SEARCH_URL,
    REACT_APP_WIKI_SECTION_QUERY_URL,
    REACT_APP_WIKI_SECTION_PARSE_URL,
} from 'react-native-dotenv';

const cheerio = require('cheerio')


const getTruncatedText = (text, len) => {
    const truncated = text.slice(0, text.lastIndexOf('.', len) + 1);
    const frst_sen = text.slice(0, text.indexOf('.') + 1);
    if (truncated.length > frst_sen.length)
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

export const getIngredientSearchResultsAsync = async (ingredient) => {
    try {
        const responseJson = await (await fetch(REACT_APP_WIKI_SEARCH_URL + ingredient)).json();
        return (responseJson[1]);
    } catch (error) {
        console.error(error);
        return [];
    }
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
        const ingredientUsageText = await getIngredientUsageAsync(ingredient);
        const text = (ingredientUsageText != null)? ingredientUsageText : pages_obj[page_id]["extract"].replace("\n", " ");
        return { "text": getTruncatedText(text, 250), "visual": img_url, "page_url": page_url };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getIngredientUsageAsync = async (ingredient) => {
    try {
        const response = await fetch(REACT_APP_WIKI_SECTION_QUERY_URL + ingredient.toLowerCase().replace(" ", "_"));
        const responseJson = await response.json();
        const sections = responseJson["parse"]["sections"];
        let section_id = null;
        let section_title = null;
        for (let i = 0; i < sections.length; i++) {
            const section_title_words = sections[i]["line"].split(" ");
            if (section_title_words.includes("Use") || section_title_words.includes("Uses")) {
                section_id = sections[i]["index"];
                section_title = sections[i]["line"];
                break;
            }
        }
        const sectionParseResponse = await fetch(REACT_APP_WIKI_SECTION_PARSE_URL + ingredient.toLowerCase().replace(" ", "_") + "&section=" + section_id)
        const sectionParseResponseJson = await sectionParseResponse.json();
        const html = sectionParseResponseJson["parse"]["text"]["*"];
        return cheerio.load(html).text().replace(section_title+"[edit]","").replace("\n"," ").trim();


    } catch (error) {
        console.log(error);
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
        const page_title = pages_obj[page_id]["title"].replace("Cookbook:", "");
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
        text = text.slice(text.indexOf("\n", text.lastIndexOf("|"))).replace("\n", " ").trim();
        return { "text": getTruncatedText(text, 250), "visual": img_url, "page_url": page_url };
    } catch (error) {
        console.error(error);
        return null;
    }
}
