//data
const api = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    params: {
        "api_key": API_KEY,
        "language": navigator.language | "es-ES"
    },
    headers: {
        'Content-Type': "application/json;charset=utf-8"
    }
});

function getLikedMoviesList(){
    const movies = localStorage.getItem("liked_movies");
    return JSON.parse(movies) || {};
}

function likeMovie(movie){
    const likedMovies = getLikedMoviesList();

    if(likedMovies[movie.id]){ //remover la pelicula
        delete likedMovies[movie.id]
    } else { // agregar la pelicula
        likedMovies[movie.id] = movie;
    } 

    localStorage.setItem("liked_movies", JSON.stringify(likedMovies));
    getLikedMovies();
}

//utils
const lazyLoader = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting){
            let target = entry.target;
            let url = target.getAttribute("data-img");
            target.setAttribute("src", url);
            observer.unobserve(target);
        }
    })
});

function createMovies(
    container, 
    movies, 
    {
        lazyLoad = false, 
        clean = true
    } = {}
){
    if(clean){
        container.innerHTML = "";
    }

    const likedMovies = getLikedMoviesList();

    movies.forEach(movie => {
        const movieContainer = document.createElement("div");
        movieContainer.classList.add("movie-container");
        
        const movieImg = document.createElement("img");
        movieImg.classList.add("movie-img");
        movieImg.setAttribute("alt", movie.title);
        movieImg.setAttribute(lazyLoad ? "data-img" : "src", "https://image.tmdb.org/t/p/w300" + movie.poster_path);
        movieImg.addEventListener("error", () => {
            movieImg.setAttribute("src", "https://static.platzi.com/static/images/error/img404.png")
        })
        movieImg.addEventListener("click", () => {
            location.hash = "#movie=" + movie.id;
        });

        const movieBtn = document.createElement("button");
        movieBtn.classList.add("movie-btn");
        if(likedMovies[movie.id]){
            movieBtn.classList.add("movie-btn--liked");
        }
        movieBtn.addEventListener("click", () => {
            movieBtn.classList.toggle("movie-btn--liked");
            likeMovie(movie);  
        })
        
        if(lazyLoad){
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        container.appendChild(movieContainer);
    })
}

function createCategories(container, categories){
    container.innerHTML = "";
    
    categories.forEach(category => {

        const categoryContainer = document.createElement("div");
        categoryContainer.classList.add("category-container");

        const categoryTitle = document.createElement("h3");
        categoryTitle.classList.add("category-title");
        categoryTitle.setAttribute("id", 'id' + category.id);
        categoryTitle.addEventListener("click", () => {
            location.hash = `#category=${category.id}-${category.name}`;
        })
        const categoryTitleText = document.createTextNode(category.name);
        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer)

    })  
}

async function getTrendingMoviesPreview(){
    const {data} = await api("trending/movie/day");
    const movies = data.results;
    
    createMovies(trendingMoviesPreviewList, movies, {
        lazyLoad: true
    });
}

async function getCategoriesPreview(){

    const {data} = await api("genre/movie/list");

    const categories = data.genres;

    createCategories(categoriesPreviewList, categories);
}


async function getMoviesByCategory(id){
    const {data} = await api("discover/movie", {
        params: {
            with_genres: id 
        }
    });
    const movies = data.results;
    maxPage = data.total_pages;
    
    createMovies(genericSection, movies, {
        lazyLoad: true
    });
}

async function getPaginatedMoviesByCategory(id){

    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = numPage < maxPage;

    if(scrollIsBottom && pageIsNotMax){

        numPage++;

        const {data} = await api("discover/movie", {
            params: {
                with_genres: id,
                page: numPage
            }
        });
        const movies = data.results;
            
        createMovies(genericSection, movies, {
            lazyLoad: true,
            clean: false
        });
    }
}

async function getMoviesBySearch(query){
    const {data} = await api("search/movie", {
        params: {
            query
        }
    });
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(genericSection, movies);
}

async function getPaginatedMoviesBySearch(query){

    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = numPage < maxPage;

    if(scrollIsBottom && pageIsNotMax){

        numPage++;

        const {data} = await api("search/movie", {
            params: {
                query,
                page: numPage
            }
        });
        const movies = data.results;
            
        createMovies(genericSection, movies, {
            lazyLoad: true,
            clean: false
        });
    }
}


async function getTrendingMovies(){
    const {data} = await api("trending/movie/day");
    const movies = data.results;
    maxPage = data.total_pages;
    
    createMovies(genericSection, movies, {
        lazyLoad: true,
        clean: true
    });

}

async function getPaginatedTrendingMovies(){

    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = numPage < maxPage;

    if(scrollIsBottom && pageIsNotMax){

        numPage++;

        const {data} = await api("trending/movie/day", {
            params: {
                page: numPage
            }
        })
    
        const movies = data.results;
        
        createMovies(genericSection, movies, {
            lazyLoad: true,
            clean: false
        });
    }

}

async function getMovieById(movieId){
    const {data: movie} = await api("movie/" + movieId);
    
    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;
    const movieImgUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
    headerSection.style.background = `linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%, rgba(0, 0, 0, 0) 29.17%), url(${movieImgUrl})`

    createCategories(movieDetailCategoriesList, movie.genres);
    await getRelatedMoviesByID(movieId)
}

async function getRelatedMoviesByID(movieId){
    const {data} = await api(`movie/${movieId}/recommendations`);
    const relatedMovies = data.results;

    createMovies(relatedMoviesContainer, relatedMovies);
}

function getLikedMovies(){
    const likedMovies = getLikedMoviesList();
    const moviesArray = Object.values(likedMovies);
    createMovies(likedMoviesList, moviesArray, {
        lazyLoad: true,
        clean: true
    })
}