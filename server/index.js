const http = require('http');
const path = require('path');
const express = require('express');
const twitterHelper = require('./twitter-helper');

const app = express();

const staticPath = path.join(__dirname, '../frontend');
app.use(express.static(staticPath));

app.get('/latest_tweet', (req, res, next) => {
    return twitterHelper.getTweet()
        .then((response) => {
            return res.status(200).json(response);
        })
        .catch((error) => {
            return res.status(400).json('{ error: \'Invalid request or response\' }');
        });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('listening');
});