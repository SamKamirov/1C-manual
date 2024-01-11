const menuButton = document.querySelector('.pages-menu-button');
const pagesContainer = document.querySelector('.pages');
const pages = document.querySelectorAll('.pages-list-item');
const frame = document.querySelector('.side-view');
const contentTitle = document.querySelector('.content-title');

const togglePagesVisibility = () => pagesContainer.classList.toggle('hidden')

const onMenuBtnClick = () => togglePagesVisibility();

const renderNewPage = (page) => frame.src = `./static/pages/${page.textContent}.html`;

const hideMenu = () => pagesContainer.classList.add('hidden');

const setTitle = (title) => contentTitle.textContent = title;

const onPageClick = (e) => {
    renderNewPage(e.target);
    setTitle(e.target.textContent);
    hideMenu();
};

const setMenuListener = () => menuButton.addEventListener('click', onMenuBtnClick);

const setPagesListeners = () => pages.forEach((page) => page.addEventListener('click', onPageClick));

const init = () => {
    setMenuListener();
    setPagesListeners();
}

init();