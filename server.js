const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.text());

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.listen(PORT, ()=>{
    console.log('Listening on port: ' + PORT);
});