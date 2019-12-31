import { getIngredientDescriptionFromCookbookAsync, getIngredientDescriptionFromWikiAsync } from './Wiki';
import { getFDAFilteredWordListAsync } from './FDA';
import { isIngredientInUPCAsync } from './UPC';

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
    console.log(error);
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
    const charProcessedList = word_lst.map(x => x.toLowerCase().replace(/[^A-Za-z\s]+/g, "").trim()).filter(x => x != "" && x.length > 1);
    const multiWordsFormattedList = charProcessedList.map((x) => {
      return x.split(" ").map(x => x.trim()).filter(x => x != "").map(x => x[0].toUpperCase() + x.slice(1)).reduce((a, b, i) => ((i == 0) ? b : a + " " + b), "");
    });
    const removedDuplicates = multiWordsFormattedList.filter((x, i) => multiWordsFormattedList.indexOf(x) === i);
    const [FDAFilteredList, notInFDAList] = await getFDAFilteredWordListAsync(removedDuplicates, true);

    let filteredNotInFDAList = [];
    for (let i = 0; i < notInFDAList.length; i++) {
      if(await isIngredientInUPCAsync(notInFDAList[i]))
        filteredNotInFDAList.push(notInFDAList[i]);
    }
    return [...FDAFilteredList, ...filteredNotInFDAList];
  } catch (error) {
    console.log(error);
  }
  return [];
}