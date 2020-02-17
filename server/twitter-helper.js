const https = require('https');
const env = require('./env.json');


const { encodeRFC, encodeBase64 } = require('./url-encoder');

const request = https.request;

const CONSUMER_TOKEN = process.env.CONSUMER_TOKEN || env.CONSUMER_TOKEN;
const CONSUMER_TOKEN_SECRET = process.env.CONSUMER_TOKEN_SECRET || env.CONSUMER_TOKEN_SECRET;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || env.ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || env.ACCESS_TOKEN_SECRET;

class TwitterHelper {
    constructor() {
        this.latestTweet = {};
        this.auth_token = null;
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            const RFC_CONSUMER_TOKEN = encodeRFC(CONSUMER_TOKEN);
            const RFC_CONSUMER_TOKEN_SECRET = encodeRFC(CONSUMER_TOKEN_SECRET);
            const BEARER = `${RFC_CONSUMER_TOKEN}:${RFC_CONSUMER_TOKEN_SECRET}`;
            const BEARER_Base64 = encodeBase64(BEARER);

            const data = 'grant_type=client_credentials';

            const req = request({
                host: 'api.twitter.com',
                path: '/oauth2/token',
                headers: {
                    'Authorization': `Basic ${BEARER_Base64}`,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                },
                method: 'POST',
            }, function (res) {
                if (res.statusCode !== 200) {
                    return reject({ statusCode: res.statusCode, message: res.statusMessage });
                }
                // holds all chunks
                const chunks = [];

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    try {
                        const responseBody = Buffer.concat(chunks);
                        const responseJson = JSON.parse(responseBody.toString());
                        return resolve(responseJson);
                    } catch (e) {
                        return reject({ statusCode: 400, message: 'Invalid response' });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            })

            req.write(data);
            req.end();
        });
    }

    getLatestTweet() {
        const authToken = this.auth_token;
        return new Promise((resolve, reject) => {
            const req = request('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=potus&count=1', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                }
            }, function(res) {
                if (res.statusCode !== 200) {
                    return reject({ statusCode: res.statusCode, message: res.statusMessage });
                }
                // holds all chunks
                const chunks = [];

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    try {
                        const responseBody = Buffer.concat(chunks);
                        const responseJson = JSON.parse(responseBody.toString());
                        return resolve(responseJson);
                    } catch (e) {
                        return reject({ statusCode: 400, message: 'Invalid response' });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            })

            req.end();
        });
    }

    getTweet() {
        let promise = Promise.resolve();
        if (!this.auth_token) {
            promise = this.authenticate()
                .then((res) => {
                    this.auth_token = res.access_token;
                    return Promise.resolve();
                });
        }
        return promise.then(() => this.getLatestTweet());
    }



}

const twitterHelper = new TwitterHelper();

module.exports = twitterHelper;