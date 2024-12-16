const axios = require("axios");
const fs = require("fs");

const options = {
    method: 'GET',
    url: 'https://imdb-top-100-movies.p.rapidapi.com/',
    headers: {
      'x-rapidapi-key': 'f0173e53afmsh14fc9fdda1ad657p15f817jsn6695d64bbb53',
      'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com'
    }
  };
  

axios.request(options).then(function (response) {
    let v = response.data;
    console.log(v);
    const data = JSON.stringify(v);

    fs.writeFile("movies.json", data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}).catch(function (error) {
    console.error(error);
});
