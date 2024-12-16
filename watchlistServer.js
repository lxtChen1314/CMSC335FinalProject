const express = require("express");
const path = require("path");
const portNumber = 5000;
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) 

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};

const { MongoClient, ServerApiVersion } = require('mongodb');
const { request } = require("http");

const uri = `mongodb+srv://${username}:${password}@cluster0.i2jmk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));

app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}));


app.get("/", (request, response) => {
    response.render("index", {error: ""});
});


app.post("/result", async (request, response) => {
    let movieTitle = request.body.movieTitle;
    let movie;
    
    try{
        const movieList = require("./movies.json");
        const the_movie = movieList.find(m => m.title.toLowerCase() === movieTitle.toLowerCase());
        
        movie = {
            title: the_movie.title,
            image: the_movie.image,
            description: the_movie.description,
            year: the_movie.year,
            genre: the_movie.genre,
            rating: the_movie.rating
        }
        response.render("result", movie)

    } catch (e) {
        console.error(e);
        response.render("index", {error: "Movie Not Found!"});
    } finally {
        await client.close();
    }
});

app.get("/watchList", async (request, response) => {
    try {
        await client.connect();
        const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find();
        const result = await cursor.toArray();
        let watchlistTable = `<table border = "1">
                                    <theader>
                                        <tr>
                                            <th>Movie Title</th>
                                            <th>Year</th>
                                            <th>Genre</th>
                                            <th>Description</th>
                                        </tr>
                                    </theader>
                                    <tbody>`;
        result.forEach(movie => {
            watchlistTable += `<tr>
                                    <td>${movie.title}</td>
                                    <td>${movie.year}</td>
                                    <td>${movie.genre}</td>
                                    <td>${movie.description}</td>
                                </tr>`;
                                
        });
        watchlistTable += `</tbody></table>`;
        response.render("watchList", { watchlistTable });


    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.post("/watchList", async (request, response) => {
    let movieTitle = request.body.movieTitle;
    let movieYear = request.body.year;
    let movieGenre = request.body.genre;
    let movieDescription = request.body.description;

    let movie;
    try {
        await client.connect();

        movie = {
            title: movieTitle,
            year: movieYear,
            genre: movieGenre,
            description: movieDescription
        }

        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(movie);
        response.redirect("watchList");
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.post("/remove", async (request, response) => {
    try{
        await client.connect();
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({});
        response.redirect("watchList");
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});



app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
const prompt = "Stop to shutdown the server: ";
process.stdin.setEncoding("utf-8");
process.stdout.write(prompt);
process.stdin.on('readable', function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            console.log("Shutting down the server");
            process.exit(0);
        } else {
            process.stdout.write(`Invalid command: ${command} \n`);
        }
        
    }
    process.stdout.write(prompt);
    process.stdin.resume();
})