import APIClient from 'omdb-api-client';
const omdb = new APIClient();

export default {
  title (title) {
  return omdb({t: title}).list();
  },

  imdb (imdb) {
  return omdb({i: imdb}).list();
  },
  populate (movie, newData = {}) {
    newData.OMDb = true;
    newData.OMDbdata = movie;
    newData.OMDbRef = movie.imdb;
    newData.title = movie.title;
    newData.genres = movie.genres;
    newData.released = movie.released;
    newData.year = movie.year;
    newData.directors = movie.directors;
    newData.countries = movie.countries;
    if (movie.metascore) newData.metascore = movie.metascore;
    return newData;
  }
}
