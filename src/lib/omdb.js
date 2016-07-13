import APIClient from 'omdb-api-client';
const omdb = new APIClient();

export title function(title) {
  return obdm({t: title}).list();
}

export imdb function(imdb) {
  return omdb({i: imdb}).list();
}
