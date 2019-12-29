import { getIngredientDescriptionFromCookbookAsync, getIngredientDescriptionFromWikiAsync } from './Wiki';
import { isIngredientInFDAAsync } from './FDA';
import { isIngredientInUPC } from './UPC';

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

export const filterWordListAsync = async (word_lst = []) => {
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
  let filtered_lst = [];
  try {
    for (let i = 0; i < Math.min(10, word_lst.length); i++) {
      if(word_lst.indexOf(word_lst[i]) != i)
        continue;
      let filtered_word = word_lst[i].toLowerCase().trim();
      // console.log("filtered_word",filtered_word);
      const letters = /^[a-zA-Z\s]*$/;
      if (filtered_word != "" && filtered_word.length > 1 && letters.test(filtered_word) ) {
        
        let words = filtered_word.split(" ");
        filtered_word = "";
        words.forEach(x => {
          filtered_word += " " + x[0].toUpperCase() + x.slice(1);
        });
        filtered_word = filtered_word.slice(1);
        // console.log(filtered_word);
        // console.log(filtered_word);

        //console.log(await isIngredientInUPC("Disodium Phosphate"));
        if (await isIngredientInFDAAsync(filtered_word) || await isIngredientInUPC(filtered_word))
          filtered_lst.push(filtered_word);
      }
    }
    //console.log("filtered list", filtered_lst);
  } catch (error) {
    console.log(error);
  }
  return filtered_lst;
}