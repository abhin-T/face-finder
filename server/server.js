import { serpapi_api } from '../config.js'

const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path');

const port = 5000;

app.use(express.static(path.join(__dirname + "/public")));

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// })

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post("/api", (req, res) => {
    const imgSource = req.body.image;
    axios.get(`https://serpapi.com/search.json?engine=google_reverse_image&image_url=${imgSource}&api_key=${serpapi_api}`).then((response) => {
        const imgResults = response.data.image_results;
        let paragraph = "";
        for (i=0; i<imgResults.length; i++) {
            paragraph += " " + imgResults[i].title;
        }
        paragraph = paragraph.toLowerCase();
        const words = paragraph.split(/[\W_]+/g);
        const wordMap = {};
        let maxCount = 1;
        let maxWord = words[0];
        for (const word of words) {
            if (wordMap[word] == null) {
                wordMap[word] = 1
            } else {
                wordMap[word]++;
            }
            if (wordMap[word] > maxCount) {
                maxCount = wordMap[word];
                maxWord = word;
            }
        }
        res.send(maxWord.charAt(0).toUpperCase() + maxWord.slice(1));
    })
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})