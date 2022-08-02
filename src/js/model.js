import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, API_KEY } from './config.js';
import { AJAX } from './helper.js';

export const state = {
  recipe: {},
  search: {
    results: [],
    query: '',
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  console.log(recipe);
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,

    ...(recipe.key && { key: recipe.key }), // this was used to prevent from having the 'undefined' if key: recipe.key was used on recipes that are gotten directly from the API. don't forget that the && returns the first falsy value
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
    console.log(state.recipe);
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page; // this will change the value of the property in the state object if declared
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end); // this will always give the 'end - 1' since the slice method doesn't include the last item to be used
};

// function to calculate new servings
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
  }); // this is what will make the ingerdients be proportional to the required servings
  state.recipe.servings = newServings;
};

// SECTION storing into local storage
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks)); // make the data from the bookmarks a string
};

// function for the bookmark
export const addBookmark = function (recipe) {
  // add bookmark
  state.bookmarks.push(recipe);
  // mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true; // creating a new property on the recipe object
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  // remove current recipe as bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

// SECTION getting from the local storage
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage); // make the storage variable an object
};

init();
// console.log(state.bookmarks);

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

// SECTION for the new recipe
export const uploadRecipe = async function (newRecipe) {
  try {
    console.log(newRecipe);
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! please use the correct format'
          );
        const [quantity, unit, description] = [...ingArr];
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: newRecipe.cookingTime,
      servings: newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
    console.log(state.recipe);
  } catch (err) {
    throw err;
  }
};
