const express = require('express');
const bodyParser = require('body-parser');
const csv = require('fast-csv');
const app = express();

const zipcodes = require('zipcodes');
var dist = zipcodes.distance(62959, 90210); 
// dist = 1662

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.text());

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.post('/getDist', (req, res)=>{
    const {csvString} = req.body;
    csv.fromString(csvString, {headers: true})
    .on('data', (data)=>{
        res.send({parsed: data});
    });
});

app.listen(PORT, ()=>{
    console.log('Listening on port: ' + PORT);
});
