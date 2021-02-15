/* jshint esversion: 10 */
REACT_APP_COOKBOOK_API_URL = 'https://en.wikibooks.org/w/api.php?format=json&action=query&prop=images|info|extracts&exintro&explaintext&redirects=1&inprop=url&titles=Cookbook:';
REACT_APP_WIKI_QUERY_URL = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=pageimages|info|extracts&exintro&explaintext&redirects=1&pithumbsize=1000&inprop=url&titles=';
REACT_APP_WIKI_SEARCH_URL = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=10&search=';
REACT_APP_WIKI_SECTION_QUERY_URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=sections&disabletoc=1&page=';
REACT_APP_WIKI_SECTION_PARSE_URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&disabletoc=1&page=';
WIKI_IMAGE_FILE_TO_URL_QUERY = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=imageinfo&iiprop=url&titles=Image:';

const fs = require('fs');
const axios = require('axios');

const getParsedIngredient = (ingredient) => ingredient.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ \([A-Za-z0-9]+\)/, '')
  .replace(/[^A-Za-z0-9 ]/g, ' ')
  .replace(/\s\s+/g, ' ')
  .trim();

const getParsedData = (data) => {
  data = data.map((x) => getParsedIngredient(x));
  data = data.filter((x) => x.trim().length > 2);
  data = Array.from(new Set(data));
  return data;
};

const getProcessedURL = (url = '') => ((url.includes('http')) ? url : `https:${url}`);

const getTruncatedText = (text = '', len = 0) => {
  const truncated = text.slice(0, text.lastIndexOf('.', len) + 1);
  const frst_sen = text.slice(0, text.indexOf('.') + 1);
  if (truncated.length > frst_sen.length) return truncated;
  return frst_sen;
};

const getIngredientDescriptionFromWikiAsync = async (ingredient) => {
  try {
    let response;
    while (true) {
      try {
        response = await axios.get(encodeURI(REACT_APP_WIKI_QUERY_URL + ingredient.toLowerCase()), {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
        });
        break;
      } catch (error) {
        // console.log("wiki request", error);
        if (error.response) {
          break;
        } else {
          console.log('network error, retrying');
        }
      }
    }
    const responseJson = response.data;
    const pages_obj = responseJson.query.pages;
    const page_id = Object.keys(pages_obj)[0];
    const page_id_obj = pages_obj[page_id];
    const page_url = getProcessedURL(page_id_obj.fullurl);
    const title = page_id_obj.title.replace(/[A-Za-z0-9 ]+\:/g, '').replace(/ \([A-Za-z0-9]+\)/, '').trim();

    if (page_id == '-1' || page_url.includes('disambiguation')) { return null; }
    let img_url = null;
    try {
      img_url = page_id_obj.thumbnail.source;
      img_url = getProcessedURL(img_url);
    } catch {
      img_url = null;
    }
    const ingredientUsageText = null;
    let text = (ingredientUsageText != null) ? ingredientUsageText : page_id_obj.extract.replace(/\n+/g, ' ').replace(/\s\s+/g, ' ').trim();
    text = getTruncatedText(text, 250);
    if (text == '') { return null; }
    return {
      title, text, visual: img_url, page_url,
    };
  } catch (error) {
    console.log('getIngredientDescriptionFromWikiAsync', error);
    return null;
  }
};

const getIngredientDescriptionFromCookbookAsync = async (ingredient) => {
  try {
    let response;
    while (true) {
      try {
        response = await axios.get(encodeURI(REACT_APP_COOKBOOK_API_URL + ingredient), {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
        });
        break;
      } catch (error) {
        // console.log("cookbook request", error);
        if (error.response) {
          break;
        } else {
          console.log('network error, retrying');
        }
      }
    }
    const responseJson = response.data;
    const pages_obj = responseJson.query.pages;
    const page_id = Object.keys(pages_obj)[0];
    const page_id_obj = pages_obj[page_id];
    const page_url = getProcessedURL(page_id_obj.fullurl);
    const title = page_id_obj.title.replace(/[A-Za-z0-9 ]+\:/g, '').replace(/ \([A-Za-z0-9]+\)/, '').trim();
    if (page_id === '-1' || page_url.includes('disambiguation')) { return null; }
    const img_arr = (Object.keys(page_id_obj).includes('images')) ? page_id_obj.images : null;
    let img_url = null;
    for (let i = 0; i < ((img_arr !== null) ? img_arr.length : 0); i++) {
      const img_title = img_arr[i].title.replace(/[A-Za-z0-9 ]+\:/g, '');
      if (img_title.includes('.jpg')) {
        var response2;
        while (true) {
          try {
            response2 = await axios.get(encodeURI(WIKI_IMAGE_FILE_TO_URL_QUERY + img_title), {
              method: 'get',
              headers: { 'Content-Type': 'application/json' },
            });
            break;
          } catch (error) {
            // console.log("cookbook picture request", error)
            if (error.response) {
              break;
            } else {
              console.log('network error, retrying');
            }
          }
        }
        const response2Json = response2.data;

        const page_id2 = Object.keys(response2Json.query.pages)[0];
        try {
          img_url = response2Json.query.pages[page_id2].imageinfo[0].url;
          img_url = getProcessedURL(img_url);
        } catch {
          img_url = null;
        }
        break;
      }
    }
    let text = page_id_obj.extract;
    text = text.slice(text.indexOf('\n', text.lastIndexOf('|'))).replace(/\n+/g, ' ').replace(/\s\s+/g, ' ').trim();
    return {
      title, text: getTruncatedText(text, 250), visual: img_url, page_url,
    };
  } catch (error) {
    console.log('getIngredientDescriptionFromCookbookAsync', error);
    return null;
  }
};

const getIngredientsToDescriptionAsync = async (ingredient) => {
  let ingredients_to_description = null;
  try {
    const cookbook_dscrption = await getIngredientDescriptionFromCookbookAsync(ingredient);
    const dscrption = (cookbook_dscrption != null) ? cookbook_dscrption : await getIngredientDescriptionFromWikiAsync(ingredient);
    if (dscrption !== null) {
      ingredients_to_description = dscrption;
    }
    return ingredients_to_description;
  } catch (error) {
    console.log('getIngredientsToDescriptionAsync', error);
  }
  return null;
};

const main = async () => {
  in_list = [...require('./new_data.json')];
  in_list = in_list.map((x) => x.toLowerCase().trim());
  in_list = Array.from(new Set(in_list));
  console.log(in_list.length);
  ingredients_obj_list = [...require('./ingredients_obj_list_copy.json')];
  for (let i = 0; i < in_list.length; i++) {
    if (i % 10 == 0) {
      console.log(i, ingredients_obj_list.length);
      fs.writeFile('./ingredients_obj_list_copy.json', JSON.stringify(ingredients_obj_list, null, 4), 'utf8', () => { });
    }
    input = in_list[i];
    const ds = await getIngredientsToDescriptionAsync(input);
    input = getParsedIngredient(input);
    if (ds !== null) {
      /*
            if (!ingredients_obj_list.map((x) => x["label"]).includes(input)) {
                ingredients_obj_list.push(
                    {
                        "label": input,
                        "data": ds
                    }
                    )
                }
                */
      const parsedTitle = getParsedIngredient(ds.title);

      ds.nut = true;
      // console.log(input, ds)

      if (!ingredients_obj_list.map((x) => x.label).includes(parsedTitle)) {
        ingredients_obj_list.push(
          {
            label: parsedTitle,
            data: ds,
          },
        );
      } else {
        for (let idx_j = 0; idx_j < ingredients_obj_list.length; idx_j++) {
          if (ingredients_obj_list[idx_j].data.title == parsedTitle) { ingredients_obj_list[idx_j].data.nut = true; }
        }
      }
    }
  }
  fs.writeFile('./ingredients_obj_list_copy.json', JSON.stringify(ingredients_obj_list, null, 4), 'utf8', () => { });
};
main().then(() => { console.log('finished'); }).catch(console.error);
