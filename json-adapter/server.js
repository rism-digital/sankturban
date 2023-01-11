const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

const getArgs = require('./model/argvHelper.js');


// Enable CORS for everybody
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const args = getArgs();
const devMode = args.env && args.env == 'dev';
const path = devMode ? '../' : './';

const data = require(`${path}dataset/st_urban-index.json`);
const fulltext = require(`${path}dataset/st_urban-fulltext.json`);

app.get('/api/browse', (req, res) => {

    const index = req.query.index;
    const params = req.query.params && JSON.parse(req.query.params);

    if (devMode) {
        console.log('[REQUEST_PAYLOAD]');
        console.log(req.query);
    }

    const response = Object.keys(data[index]).map(key => {

        // check for bio_anchor value
        const anchor = data[index][key].filter(e => e.bio_anchor)

        // fetching groups without bio anchor
        const group = data[index][key].filter(e => !e.bio_anchor)

        return ({
            name: key,
            group,
            ...anchor.length > 0 && { bio_anchor: anchor[0].bio_anchor }  
        });
    });

    if (devMode) {
        console.log('[RESPONSE_PAYLOAD]');
        console.log(response);
    }

    res.send(response);
});


app.get('/api/search', (req, res) => {
    const key = req.query.key.toLowerCase();

    if (devMode) {
        console.log('[REQUEST_PAYLOAD]');
        console.log(req.query);
    }

    const results = [];

    fulltext.forEach(elem => {
        if (elem.transcription.toLowerCase().includes(key)) {
            results.push(elem);
        }
    });

    if (devMode) {
        console.log('[RESPONSE_PAYLOAD]');
        console.log(results);
    }

    res.send(results);
});

app.listen(port, () => devMode && console.log(`Listening on port ${port}`));
