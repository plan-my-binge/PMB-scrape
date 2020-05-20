const {Client} = require('pg')
const client = new Client()


const theMovieDb = require('./tmdb')
theMovieDb.common.api_key = "API_KEY";

client.connect()
client.query(`
            SELECT tconst
                from title_basics WHERE titletype IN ('tvSeries', 'tvMiniSeries')  order by tconst limit 40000 offset 200000
  `, [],
  (err, res) => {
  res.rows.forEach(function (row, index) {
    theMovieDb.find.getById({
      id: row.tconst,
      external_source: 'imdb_id'
    }, (data) => {
      let parsedData = JSON.parse(data);
    if ((parsedData['tv_results'].length === 0)) {
      console.log("no result")
      return;
    }
    let backdropPath = parsedData['tv_results'][0].backdrop_path;
    let posterPath = parsedData['tv_results'][0].poster_path;
    if (!backdropPath && !posterPath) {
      console.log("no poster " + index)
      return;
    }
    client.query(`INSERT INTO title_posters VALUES($1, $2, $3)`, [row.tconst, backdropPath, posterPath],
      (err, response) => {
      console.log("inserted entry")
    })
  }, () => {
    })
  });
})

