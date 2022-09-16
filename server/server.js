const express = require('express');
const app = express();
const axios = require('axios');

app.get("/api", (req, res) => {
    
    axios.get('https://serpapi.com/search.json?engine=google_reverse_image&image_url=https://i.imgur.com/5bGzZi7.jpg&api_key=0f3db242ed06c9cd4b3eed9b2042812598a2164ec8edfa434fbf6fb23cc0608b').then((response) => {
        res.json(response.data.search_information.query_displayed);
    })
})

app.listen(5000, () => {
    console.log("Server started on port 5000");
})