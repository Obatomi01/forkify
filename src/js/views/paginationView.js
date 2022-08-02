import View from './View';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numOfPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    // page1, and there are other pages
    if (curPage === 1 && numOfPages > 1) {
      return `
        <button data-goto="${
          curPage + 1
        }" class="btn--inline pagination__btn--next">
        <span>Page ${curPage + 1}</span>
        <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
        </svg>
        </button>`;
    }

    // last page
    if (numOfPages > 1 && curPage === numOfPages) {
      return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>`;
    }

    // other pages. Neither the first page nor the last page
    if (numOfPages > 1 && curPage < numOfPages) {
      return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                  <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${curPage - 1}</span>
        </button>
        <button data-goto="${
          curPage + 1
        }" class="btn--inline pagination__btn--next">
                <span>Page ${curPage + 1}</span>
                <svg class="search__icon">
                 <use href="${icons}#icon-arrow-right"></use>
                </svg>
        </button>`;
    }

    // page1, but no other pages
    return '';
  }
}

export default new PaginationView();
