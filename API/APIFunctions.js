import { getIngredientDescriptionFromCookbookAsync, getIngredientDescriptionFromWikiAsync } from './Wiki';
import { getFDAFilteredWordListAsync } from './FDA';
import { isIngredientInUPCAsync } from './UPC';
const nlp = require('compromise');

export const getIngredientsToDescriptionAsync = async (ingrdnts_lst = []) => {
  let ingredients_to_description = [];
  try {
    for (let i = 0; i < ingrdnts_lst.length; i++) {
      const name = ingrdnts_lst[i];
      const cookbook_dscrption = await getIngredientDescriptionFromCookbookAsync(name);
      const dscrption = (cookbook_dscrption != null) ? cookbook_dscrption : await getIngredientDescriptionFromWikiAsync(name);
      if (dscrption !== null) {
        ingredients_to_description.push({ "name": name, "text": dscrption["text"], "visual": dscrption["visual"], "page_url": dscrption["page_url"] });
      }
    }
  } catch (error) {
    console.log("getIngredientsToDescriptionAsync", error);
  }
  return ingredients_to_description;
}

export const getFilteredWordListAsync = async (word_lst = []) => {
  /*
      filter
        -ingredient not in FDA
        -leading and trailing spaces
        -letters only
        -empty strings
        -strings of length 1
        -duplicates
        -for valid strings:
          -Capitalize the first letter of each word
            -Account for ingredients with multiple words
      */

  try {
    const filteredList = word_lst.reduce((a, c) => {
      const regexProcessed = c.toLowerCase().replace("\n", " ").replace(/[^A-Za-z\s]+/g, " ").trim();
      //console.log(regexProcessed);
      const formatted = regexProcessed.split(" ").reduce((a, b, i) => {
        const cased = (b=="")? "" : b[0].toUpperCase() + b.slice(1);
        return (i == 0) ? cased : a + " " + cased;
      }, "");
      return (formatted != "" &&
        formatted.length > 1 &&
        nlp(formatted).nouns().out() != "" &&
        !a.includes(formatted)) ? [...a, formatted] : a;
    }, []);
    const [FDAFilteredList, notInFDAList] = await getFDAFilteredWordListAsync(filteredList, true);
    console.log("fdaFiltered:",FDAFilteredList,"notInFDA:",notInFDAList);
    let filteredNotInFDAList = [];
    for (let i = 0; i < notInFDAList.length; i++) {
      if (await isIngredientInUPCAsync(notInFDAList[i]))
        filteredNotInFDAList.push(notInFDAList[i]);
    }
    return [...FDAFilteredList, ...filteredNotInFDAList];
  } catch (error) {
    console.log("getFilteredWordListAsync", error);
  }
  return [];
}