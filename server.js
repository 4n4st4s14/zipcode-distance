const express = require('express');
const bodyParser = require('body-parser');
const csv = require('fast-csv');
const distance = require('google-distance-matrix');
const zipcode = require('zipcode');
const app = express();
const fs = require('fs');

distance.key('AIzaSyAP_SwCt8FpuCJxpiiQ_90N0yP3U2v5LWw');
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
    // console.log('dataArr: ', dataArr);
    let lastIndex = dataArr.length - 1;
    if(!dataArr[lastIndex]){
        dataArr.splice(lastIndex, 1);
    }
    dataArr.splice(0, 1);
    // console.log('dataArr: ', dataArr);
    // console.log('dataArrLength : ', dataArr.length);

    let apiRuns = Math.ceil(dataArr.length / 10);
    let curIndex = 0;
    let complete = [];
    let origins = [];
    let destinations = ['Washington DC', 'Arlington, VA', 'Ashburn, VA'];    
    let csvStream = csv.format({headers: true});
    let writableStream = fs.createWriteStream("my.csv");
    let successWrites = 0;
    writableStream.on('finish', ()=>{
        // console.log('Done');
    });
    csvStream.pipe(writableStream);
    csv.fromString(csvString, {headers: true})
    .on('data', (data)=>{
        console.log(dataArr.length);
        console.log(curIndex);
        origins.push(`${data.ZIPCODE}`);
        complete.push(data);
        if(curIndex === dataArr.length -1){
            console.log('here');
            for(let x = 0; x < apiRuns; x++){
                let begin = x === 0 ? x : x * 10;
                let end = (x + 1) * 10;
                let curOrigins = [];
                curOrigins = origins.slice(begin, end);
                console.log(curOrigins);
                setTimeout(()=>{
                    distance.matrix(curOrigins, destinations, (err, distances)=>{
                        if(err){
                            // console.log('ERROR');
                            // console.log(err);
                            res.status(400).end(err);
                        }
                        else{
                            // console.log('DIST DATA', curIndex);
                            // console.log(distances);                
                            // console.log('data: ', data);
                            if (distances.status == 'OK') {
                                //Every origin
                                for (let i=0; i < curOrigins.length; i++) {
                            
                                    // Every Destination for that origin
                                    for (let j = 0; j < destinations.length; j++) {
        
                                        let origin = distances.origin_addresses[i];
                                        let destination = distances.destination_addresses[j];
        
                                        // If data is ok
                                        if (distances.rows[i].elements[j].status === 'OK') {
                                            // Current Distance 
                                            let distance = distances.rows[i].elements[j].distance.text;
        
                                            //If destinatoin is ashburn fill in ashburn field
                                            if(destination.includes('Ashburn')){
                                                complete[begin + i]['Distance from 45085 University Dr, Ashburn, VA 20147'] = distance;    
                                                successWrites++;
                                            }
                                            //If destinatoin DC ashburn fill in DC field                                    
                                            if(destination.includes('Washington') && complete[i].Location.includes('Washington')){
                                                complete[begin + i]['Distance from Address in Column b'] = distance;
                                                complete[begin + i].State = 'DC';
                                                                                        
                                            }
                                            //If destinatoin is arlington fill in arlington field                                    
                                            if(destination.includes('Arlington') && complete[i].Location.includes('Arlington')){
                                                complete[begin + i]['Distance from Address in Column b'] = distance;
                                                complete[begin + i].State = 'VA';
                                            }
                                            //When the destinations loop is on its last item
                                            if(j === destinations.length -1){
                                                csvStream.write(complete[begin + i]);    
                                                    //When the Origins loop finishes
                                                if((begin + i) === (origins.length -1)){
                                                    console.log('everything done');
                                                    setTimeout(()=>{
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
                                                    }, 9000);
                                                }                        
                                            }
                                        }
                                        //If Data is not ok 
                                        else {
                                            console.log(destination + ' is not reachable by land from ' + origin);
                                            complete[begin + i].State = 'API Error';
                                            //When the destinations loop is on its last item
                                            if(j === destinations.length -1){
                                                csvStream.write(complete[begin + i]);    
                                                    //When the Origins loop finishes
                                                if((begin + i) === (origins.length -1)){
                                                    console.log('everything done');
                                                    setTimeout(()=>{
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
                                                    }, 9000);
                                                }                        
                                            }
                                        }
                                    }
                                }
                            }
                            else{
                                console.log('begin: ', begin);
                                console.log('DistData: ', distances);
                                console.log(x, apiRuns);
                                if(x === apiRuns -1){
                                    console.log('ending');
                                    setTimeout(()=>{
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
                                    }, 9000);
                                }
                            }
                        }
                    });
                }, 1000);
            }
        }
        else{
            curIndex++;
        }
        
    })
    .on('end', ()=>{
        // distance.matrix(origins, destinations, (err, distances)=>{
        //     if(err){
        //         console.log('ERROR');
        //         console.log(err);
        //         res.status(400).end(err);
        //     }
        //     else{
        //         console.log('DIST DATA', curIndex);
        //         console.log(distances);                
        //         console.log('data: ', data);
        //         // console.log(distances.destination_addresses[1]);                  
        //         // console.log(distances.rows[0].elements[1]);
        //         !studentLocation ? data.State = 'location not found' : data.State = studentLocation[1];
        //         data['Distance from Address in Column b'] = distances.status !== 'OK' ? distances.error_message : distances.rows[0].elements[0].distance.text;
        //         data['Distance from 45085 University Dr, Ashburn, VA 20147'] = distances.status !== 'OK' ? distances.error_message : distances.rows[0].elements[1].distance.text;    
        //         csvStream.write(data);
        //         complete.push(data);
        //         if(curIndex == dataArr.length -1){
        //             console.log('done');
        //             csvStream.end();   
        //             res.download('./my.csv', (err)=>{
        //                 if(err){
        //                     console.log(err);
        //                     res.status(400).send(err);
        //                 }
        //                 else{
        //                     // res.status(200).json({complete});
        //                     console.log('end');
        //                 }
        //             });
        //             console.log('end2');
        //         }
        //         else{
        //             console.log('increment');
        //             console.log(curIndex);
        //             console.log(dataArr.length);
        //             curIndex++;
        //         }
        //     }
        // });
    });
});


app.listen(PORT, ()=>{
    console.log('Listening on port: ' + PORT);
});
