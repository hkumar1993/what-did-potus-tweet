const http = require('http');
const path = require('path');
const express = require('express');
const twitterHelper = require('./twitter-helper');

const app = express();

const staticPath = path.join(__dirname, '../frontend');
app.use(express.static(staticPath));

app.get('/latest_tweet', (req, res, next) => {
    try {
        const response = twitterHelper.getTweet();
        return res.status(200).json('{}');
    } catch (e) {
        return res.status(404).json(`{ error: ${e}}`);
    }
});

app.listen(3000, function () {
    console.log('listening');
});