const express = require('express');
const bodyParser = require('body-parser');
const csv = require('fast-csv');
const distance = require('google-distance-matrix');
const zipcode = require('zipcode');
const app = express();
const fs = require('fs');

distance.key('AIzaSyBDpaZ__ByRlEfjiyudsa4HTn6NIBKMheY');
distance.units('imperial');
distance.avoid('tolls');
distance.mode('driving');

app.use(bodyParser.json({limit: '1gb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1gb' }));
app.use(bodyParser.text());

const PORT = process.env.PORT || 3000;
app.use(express.static('./public'));

app.post('/getDist', (req, res)=>{
    const {csvString} = req.body;
    console.log('=============');
    let dataArr = csvString.split('\r\n');
    let lastIndex = dataArr.length - 1;
    dataArr.splice(lastIndex, 1);
    dataArr.splice(0, 1);
    let curIndex = 0;
    let complete = [];
    let csvStream = csv.format({headers: true});
    let writableStream = fs.createWriteStream("my.csv");
    writableStream.on('finish', ()=>{
        console.log('Done');
    });
    csvStream.pipe(writableStream);
    csv.fromString(csvString, {headers: true})
    .on('data', (data)=>{
        let studentLocation = zipcode.lookup(data.ZIPCODE);
        console.log(data.Location);
        let classLocation = data.Location === 'Arlington' ? 'Arlington, VA' : 'Washington DC';
        let origin = !studentLocation ? 'location not found' : studentLocation.join(' ');
        let origins = [origin];
        let destinations = [classLocation, 'Ashburn, VA'];
        distance.matrix(origins, destinations, (err, distData)=>{
            if(err){
                console.log('ERROR');
                console.log(err);
                res.status(400).end(err);
            }
            else{
                console.log('DIST DATA', curIndex);
                
                console.log(distData.destination_addresses[1]);                  
                console.log(distData.rows[0].elements[1]);
                !studentLocation ? data.State = 'location not found' : data.State = studentLocation[1];
                data['Distance from Address in Column b'] = distData.rows[0].elements[0].distance.text;
                data['Distance from 45085 University Dr, Ashburn, VA 20147'] = distData.rows[0].elements[1].distance.text;    
                csvStream.write(data);
                complete.push(data);
                if(curIndex == dataArr.length -1){
                    console.log('done');
                    csvStream.end();   
                    res.download('./my.csv', (err)=>{
                        if(err){
                            console.log(err);
                            res.status(400).send(err);
                        }
                        else{
                            // res.status(200).json({complete});
                            console.log('end');
                        }
                    });
                    console.log('end2');
                }
                else{
                    console.log('increment');
                    console.log(curIndex);
                    console.log(dataArr.length);
                    curIndex++;
                }
            }
        });
    })
    .on('end', ()=>{
        
    });
});


app.listen(PORT, ()=>{
    console.log('Listening on port: ' + PORT);
});
