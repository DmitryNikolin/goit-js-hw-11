import 'simplelightbox';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const searchQuery = document.querySelector('input[name="searchQuery"]');
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const searchBtn = document.querySelector('.search');
const loadBtn = document.querySelector('.load-more');
const closeBtn = document.querySelector('.close-btn');

let perPage = 40;
let page = 0;
let name = searchQuery.value.trim();

loadBtn.style.display = 'none';
closeBtn.style.display = 'none';
searchBtn.style.visibility = 'hidden';

searchQuery.addEventListener('input', searchBtnAdd);

function searchBtnAdd(e) {
  let searchStr = e.target.value.trim();
  if (searchStr.length !== 0) {
    searchBtn.style.visibility = 'visible';
  } else {
    searchBtn.style.visibility = 'hidden';
    closeBtn.style.display = 'none';
    loadBtn.style.display = 'none';
    gallery.innerHTML = '';
  }
}

async function fetchImages(name, page, perPage) {
  const baseURL = 'https://pixabay.com/api/';
  const key = '30807376-0b6c24285cff505c2f1e15934';

  try {
    const response = await axios.get(
      `${baseURL}?key=${key}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    return response.data;
  } catch (error) {
    console.log('ERROR: ' + error);
  }
}

async function eventHandler(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  loadBtn.style.display = 'none';

  page = 1;
  name = searchQuery.value.trim();

  fetchImages(name, page, perPage)
    .then(name => {
      let totalPages = name.totalHits / perPage;

      if (name.hits.length > 0) {
        Notiflix.Notify.success(`We found ${name.totalHits} images.`);
        renderGallery(name);
        new SimpleLightbox('.gallery a');
        closeBtn.style.display = 'block';
        closeBtn.addEventListener('click', () => {
          searchQuery.value = '';
          closeBtn.style.display = 'none';
          loadBtn.style.display = 'none';
          searchBtn.style.visibility = 'hidden';
          gallery.innerHTML = '';
        });

        if (page < totalPages) {
          loadBtn.style.display = 'block';
        } else {
          loadBtn.style.display = 'none';
          Notiflix.Notify.info("You've reached the end of search results...");
        }
      } else {
        Notiflix.Notify.failure(
          'There are no images matching your search query. Please try again...'
        );
        gallery.innerHTML = '';
      }
    })
    .catch(error => console.log('ERROR: ' + error));
}

searchForm.addEventListener('submit', eventHandler);

function renderGallery(name) {
  const markup = name.hits
    .map(hit => {
      return `<div class="photo-card">
        <a class="gallery-item" href="${hit.largeImageURL}">
          <img
            class="gallery__image"
            src="${hit.webformatURL}"
            alt="${hit.tags}"
            loading="lazy"
        /></a>
        <div class="info">
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">thumb_up</b>
            </p>
            <p class="info-counter">${hit.likes.toLocaleString()}</p>
          </div>
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">visibility</b>
            </p>
            <p class="info-counter">${hit.views.toLocaleString()}</p>
          </div>
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">comment</b>
            </p>
            <p class="info-counter">${hit.comments.toLocaleString()}</p>
          </div>
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">download</b>
            </p>
            <p class="info-counter">${hit.downloads.toLocaleString()}</p>
          </div>
        </div>
      </div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

loadBtn.addEventListener(
  'click',
  () => {
    name = searchQuery.value;
    page += 1;
    fetchImages(name, page, perPage).then(name => {
      let totalPages = name.totalHits / perPage;
      renderGallery(name);
      new SimpleLightbox('.gallery a');
      if (page >= totalPages) {
        loadBtn.style.display = 'none';
        Notiflix.Notify.info("You've reached the end of search results...");
      }
    });
  },
  true
);

let hintElem;

document.onmouseover = function (event) {
  let target = event.target;
  let hintHtml = target.dataset.hint;
  if (!hintHtml) return;

  hintElem = document.createElement('div');
  hintElem.className = 'hint';
  hintElem.innerHTML = hintHtml;
  document.body.append(hintElem);

  let coords = target.getBoundingClientRect();

  let left = coords.left + (target.offsetWidth - hintElem.offsetWidth) / 2;
  if (left < 0) left = 0;

  let top = coords.top - hintElem.offsetHeight - 5;
  if (top < 0) {
    top = coords.top + target.offsetHeight + 5;
  }

  hintElem.style.left = left + 'px';
  hintElem.style.top = top + 'px';
};

document.onmouseout = function (e) {
  if (hintElem) {
    hintElem.remove();
    hintElem = null;
  }
};
