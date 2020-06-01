import { getIngredientDescriptionFromCookbookAsync, getIngredientDescriptionFromWikiAsync } from './Wiki';
import { getFDAFilteredWordListAsync } from './FDA';
import { isIngredientInUPCAsync } from './UPC';
import Fuse from 'fuse.js';

const nlp = require('compromise');
const Data = require('../data.json');

export function getSimilarWordsList(word="",length=5){
  const fuseOptions = {
    includeScore: true,
    shouldSort: true
  }
  const fuse = new Fuse(Data,fuseOptions)
  const result = fuse.search(word).slice(0,length).map((x)=>(x.item))
  return result
}

export const getIngredientsToDescriptionAsync = async (ingrdnts_lst = [],abortController=new AbortController()) => {
  let ingredients_to_description = [];
  try {
    for (let i = 0; i < ingrdnts_lst.length; i++) {
      const name = ingrdnts_lst[i];
      const cookbook_dscrption = null
      const dscrption = (cookbook_dscrption != null) ? cookbook_dscrption : await getIngredientDescriptionFromWikiAsync(name,abortController);
      if (dscrption !== null) {
        ingredients_to_description.push({ "name": name, "text": dscrption["text"], "visual": dscrption["visual"], "page_url": dscrption["page_url"] });
      }
    }
    return ingredients_to_description;
  } catch (error) {
    console.log("getIngredientsToDescriptionAsync", error);
  }
  return [];
}

export const getFilteredWordListAsync = async (word_lst = [],abortController = new AbortController()) => {
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
      const regexProcessed = c.toLowerCase().replace(/\n+|[^A-Za-z\s]+/g, " ").trim();
      //console.log(regexProcessed);
      const formatted = regexProcessed.split(" ").reduce((a, b, i) => {
        const cased = (b == "") ? "" : b[0].toUpperCase() + b.slice(1);
        return (i == 0) ? cased : a + " " + cased;
      }, "");

      return (formatted != "" &&
        formatted.length > 1 &&
        nlp(formatted).nouns().out() != "" &&
        formatted.split(" ").length < 5 &&
        !a.includes(formatted)) ? [...a, formatted] : a;
    }, []);

    let brokenFilteredList = [];
    let FDAFilteredList = [];
    let notInFDAList = [];
    let filteredNotInFDAList = [];

    // break filteredList into lists of 30 ingredients

    let tmpList = [];
    for (let i = 1; i <= filteredList.length; i++) {
      if (i % 30 == 0) {
        brokenFilteredList.push(tmpList);
        tmpList = [];
      }
      else
        tmpList.push(filteredList[i - 1]);
    }
    if(filteredList.length < 30)
      brokenFilteredList.push(tmpList);
    console.log("brokenFilteredList:",brokenFilteredList);

    for (let i = 0; i < brokenFilteredList.length; i++) {
      if(brokenFilteredList[i].length == 0)
        break;
      const [inFDA, notInFDA] = await getFDAFilteredWordListAsync(brokenFilteredList[i], true,abortController);
      FDAFilteredList = [...FDAFilteredList,...inFDA];
      notInFDAList = [...notInFDAList,...notInFDA];
    }

    console.log("FDAFilteredList:",FDAFilteredList);
    console.log("notInFDAList:",notInFDAList);

    for (let i = 0; i < notInFDAList.length; i++) {
      if (await isIngredientInUPCAsync(notInFDAList[i],abortController))
        filteredNotInFDAList.push(notInFDAList[i]);
    }
    console.log("filteredNotInFDAList",filteredNotInFDAList);

    return [...FDAFilteredList, ...filteredNotInFDAList];

    // console.log("filtered list",filteredList)
    // return filteredList.map((x)=>getMostAppropriateWord(x))
  } catch (error) {
    console.log("getFilteredWordListAsync", error);
  }
  return [];
}