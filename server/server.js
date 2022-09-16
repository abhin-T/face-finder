const express = require('express');
const app = express();
const axios = require('axios');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/api", (req, res) => {
    res.json({name: "Abhin"});
})

app.post("/api", (req, res) => {
    const imgSource = req.body.src;
    // axios.get(`https://serpapi.com/search.json?engine=google_reverse_image&image_url=${imgSource}&api_key=0f3db242ed06c9cd4b3eed9b2042812598a2164ec8edfa434fbf6fb23cc0608b`).then((response) => {
    //     res.send(response.data);
    // })
})

app.listen(5000, () => {
    console.log("Server started on port 5000");
})