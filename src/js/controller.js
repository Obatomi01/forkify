import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
// import { async } from 'regenerator-runtime';

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }
//SECTION getting API
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); // this will get the url
    if (!id) return;
    // spinner
    recipeView.renderSpinner();
    // update result view to mark selected result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    // loading recipe
    await model.loadRecipe(id); // this will automatically create the model.state.recipe
    // rendering recipe
    recipeView.render(model.state.recipe); // this is why the 'state' variable was meant to be exported

    controlServings();
  } catch (err) {
    recipeView.renderError();
  }
};

// SECTION controller for displaying the search results
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // get search query
    const query = searchView.getQuery();
    if (!query) return;

    // load search results
    await model.loadSearchResults(query); // this will automatically create the model.state.search

    // render search result
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));

    // display initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// SECTION controller for one of the clicks for the pagination
const controlPagination = function (num) {
  resultsView.render(model.getSearchResultsPage(num));
  paginationView.render(model.state.search);
};

// SECTION servings
const controlServings = function (newServings = 4) {
  //  update the recipe servings
  model.updateServings(newServings);

  // update the recipe view
  recipeView.update(model.state.recipe);
  // recipeView.render(model.state.recipe);
};

//SECTION listening to loads and hashtag events
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);

//SECTION bookmark
const controlAddBookmark = function () {
  // add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

// SECTION adding personal recipe
const controlAddRecipe = async function (newRecipe) {
  try {
    // spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

// SECTION occurence at the beggining of the code
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes); // this is using the publisher-subscriber method
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults); // this is using the publisher-subscriber method
  paginationView.addHandlerClick(controlPagination); // pagination
  recipeView.addHandlerAddBookmark(controlAddBookmark); // bookmark
  addRecipeView.addHandlerUpload(controlAddRecipe); // addNewRecipe
};
// recipeView.addHandlerRender(controlRecipes); // this is using the publisher-subscriber method
// searchView.addHandlerSearch(controlSearchResults); // this is using the publisher-subscriber method
init();
