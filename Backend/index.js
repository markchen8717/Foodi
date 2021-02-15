/* eslint-disable no-console */
console.log('Server is starting');
const express = require('express');

const app = express();
const Fuse = require('fuse.js');
const nlp = require('compromise');
const cheerio = require('cheerio');
const axios = require('axios');
const { Validator, ValidationError } = require('express-json-validator-middleware');
const { feedbackSchema, ingredientsSchema } = require('./schemas');

const { validate } = new Validator();

require('dotenv').config();

const port = process.env.PORT || 3000;

// Initialize database
console.log('Initializing database');
const data = require('./data/ingredients_obj_list.json');

const fuseOptions = {
  includeScore: true,
  threshold: 0.1,
  findAllMatches: false,
  keys: ['label'],
};
const fuse = new Fuse(data, fuseOptions);

function getLatestVersionString(req, res) {
  try {
    axios.get('https://play.google.com/store/apps/details?id=com.SaltyNerd.Foodi')
      .then((request) => {
        const parsedText = cheerio.load(request.data).text();
        const a = parsedText.lastIndexOf('Current Version');
        const b = parsedText.indexOf('R', a);
        const latestVersionString = parsedText.substring(a, b).replace('Current Version', '');
        res.send({ latestVersionString });
      })
      .catch((err) => console.error(err.message) || res.status(500).end());
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
}

// send user feedback to google sheet
async function handleFeedback(req, res) {
  try {
    await axios.post(encodeURI(process.env.FEED_BACK_GOOGLE_SHEET_URI), {
      email: req.body.email,
      name: req.body.name,
      message: req.body.message,
    });
    res.status(200).end();
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
}

// single ingredient search
function ingredientFuzzySearch(ingredient) {
  // console.log(fuse.search(ingredient));
  const result = fuse.search(ingredient).splice(0, 5).map((x) => (x.item));
  return result;
}

// batch ingredients search
function ingredientNonFuzzySearch(ingredient) {
  const result = [];
  // console.log("ingredient",ingredient)
  const searchLabels = Array.from(new Set([ingredient,
    nlp(ingredient).nouns().toPlural().out()
      .toLowerCase(),
    nlp(ingredient).nouns().toSingular().out()
      .toLowerCase(),
  ]));
  const searchResult = fuse.search(ingredient).splice(0, 4).map((x) => x.item);
  for (let i = 0; i < searchResult.length; i += 1) {
    const item = searchResult[i];
    const itemLabel = item.label;
    if (searchLabels.includes(itemLabel)) {
      result.push(item);
      break;
    }
  }
  return result;
}

// helper functions
const getParsedIngredient = (ingredient) => ingredient.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// eslint-disable-next-line no-unused-vars
const getParsedIngredientsArray = (array) => {
  let filteredArray = array.reduce((filtered, ingredient) => {
    const parsedIngredient = getParsedIngredient(ingredient);
    if (parsedIngredient.length > 2) {
      filtered.push(parsedIngredient);
    }
    return filtered;
  }, []);
  filteredArray = Array.from(new Set(filteredArray));
  return filteredArray;
};

const getDeduplicatedIngredientsArray = (array) => {
  const titleSet = new Set();
  const deDuplicatedArray = array.filter((x) => {
    const { title } = x.data;
    // console.log(x.label,title,title_set)
    if (!titleSet.has(title)) {
      // console.log("added")
      titleSet.add(title);
      return true;
    }
    return false;
  });
  return deDuplicatedArray;
};

// get ingredients datils from database
function getIngredients(req, res) {
  const reply = {
    ingredientsFound: [],
  };
  try {
    // console.log(req.query);
    const ingredientsToSearch = req.query.q.split(';');
    const fuzzy = Object.keys(req.query).includes('fuzzy') ? parseInt(req.query.fuzzy, 10) : 0;
    ingredientsToSearch.forEach((ingredient) => {
      const parsedIngredient = getParsedIngredient(ingredient);
      if (fuzzy) reply.ingredientsFound.push(...ingredientFuzzySearch(parsedIngredient));
      else reply.ingredientsFound.push(...ingredientNonFuzzySearch(parsedIngredient));
    });
    reply.ingredientsFound = getDeduplicatedIngredientsArray(reply.ingredientsFound);
    res.send(reply);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      ingredientsFound: [],
    });
  }
}

function validationErrorMiddleware(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  const isValidationError = error instanceof ValidationError;
  if (!isValidationError) {
    return next(error);
  }

  response.status(400).json({
    errors: error.validationErrors,
  });

  return next();
}

// Setting up Express
// use json parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.get('/ingredients', validate({ query: ingredientsSchema }), getIngredients);
app.get('/latestVersionString', getLatestVersionString);
app.post('/feedback', validate({ body: feedbackSchema }), handleFeedback);
app.get('/', (req, res) => {
  res.send('hello world');
});

// validation error handler
app.use(validationErrorMiddleware);

app.listen(port, () => console.log(`Server is now listening on port ${port}`));

// keep awake
setInterval(() => {
  axios.get(process.env.API_URI)
    .then(() => console.log('staying awake'))
    .catch((err) => console.error(err.message));
}, 20 * 60 * 1000);
