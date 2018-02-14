const express = require('express');
const bodyParser = require('body-parser');
const csv = require('fast-csv');
const distance = require('google-distance');
const zipcode = require('zipcode');
const app = express();

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.text());

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.post('/getDist', (req, res)=>{
    const {csvString} = req.body;
    let complete = [];
    csv.fromString(csvString, {headers: true})
    .on('data', (data)=>{
        let location = zipcode.lookup(`${data.zipcode}`);
        distance.get({
            origin: location.join(' '),
            destination: 'Arlington, VA',
            units: 'imperial',
            avoid: 'tolls',
            mode: 'driving'
        }, (err, distData)=>{
            if(err){
                res.status(400).json({error: err});
            }
            else{
                data.distance = distData.distance;
                complete.push(data);
            }
        });
    })
    .on('end', ()=>{
        res.send(complete);
    });
});


app.listen(PORT, ()=>{
    console.log('Listening on port: ' + PORT);
});
