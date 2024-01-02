let numPage = 1;
let maxPage;
let infiniteScroll;

searchFormBtn.addEventListener("click", () => {
    location.hash = "#search=" + searchFormInput.value;
})

trendingBtn.addEventListener("click", () => {
    location.hash = "#trends"
})

arrowBtn.addEventListener("click", () => {
    history.back();
})

window.addEventListener("DOMContentLoaded", navigate, {passive: false});
window.addEventListener("hashchange", navigate, {passive: false});
window.addEventListener("scroll", infiniteScroll, {passive: false});

function navigate(){

    if(infiniteScroll){
        window.removeEventListener("scroll", infiniteScroll, {passive: false});
        infiniteScroll = undefined;
    }

    if(location.hash.startsWith("#trends")){
        trendsPage();
    } else if(location.hash.startsWith("#search=")){
        searchPage();
    } else if(location.hash.startsWith("#movie=")){
        movieDetailsPage();
    } else if(location.hash.startsWith("#category=")){
        categoriesPage();
    } else {
        homePage();
    }
    scrollTo(0, 0);

    if(infiniteScroll){
        numPage = 1;
        window.addEventListener("scroll", infiniteScroll, {passive: false})
    }
}

function homePage(){
    console.log("Home!!");

    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.add("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerCategoryTitle.classList.add("inactive");
    headerTitle.classList.remove("inactive");
    searchForm.classList.remove("inactive");

    trendingPreviewSection.classList.remove("inactive");
    categoriesPreviewSection.classList.remove("inactive");
    genericSection.classList.add("inactive");
    movieDetailSection.classList.add("inactive");
    likedMovieSection.classList.remove("inactive");

    getTrendingMoviesPreview();
    getCategoriesPreview();
    getLikedMovies();
}

function categoriesPage(){
    console.log("Categories!!");

    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.remove("inactive");
    searchForm.classList.add("inactive");
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");
    likedMovieSection.classList.add("inactive");


    const [_, categoryData] = decodeURIComponent(location.hash).split("=");
    const [categoryId, categoryName] = categoryData.split("-");
    headerCategoryTitle.innerHTML = categoryName
    getMoviesByCategory(categoryId);

    infiniteScroll = () => {getPaginatedMoviesByCategory(categoryId)};

}


function movieDetailsPage(){
    console.log("Movies!!");

    headerSection.classList.add("header-container--long");
    //headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.add("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.add("inactive");

    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.add("inactive");
    movieDetailSection.classList.remove("inactive");
    likedMovieSection.classList.add("inactive");


    let [_, movieId] = decodeURIComponent(location.hash).split("=");
    getMovieById(movieId);
}

function searchPage(){
    console.log("Search!!");

    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.remove("inactive");

    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");
    likedMovieSection.classList.add("inactive");
    
    let [_, query] = decodeURIComponent(location.hash).split("=");
    searchFormInput.value = query;
    getMoviesBySearch(query);

    infiniteScroll = () => {getPaginatedMoviesBySearch(query)};
}


function trendsPage(){
    console.log("Trends!!");

    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.remove("inactive");
    searchForm.classList.add("inactive");

    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive"); 
    likedMovieSection.classList.add("inactive");

    headerCategoryTitle.innerHTML = "Tendencias"
    getTrendingMovies();

    infiniteScroll = getPaginatedTrendingMovies;
}