const express = require('express');
const app = express();
const request = require('request'); 
const Promise = require('es6-promise').Promise;
const NodeCache = require( "node-cache" );
const bodyParser  = require("body-parser");

const port = 4000

app.listen(port, function(){
    console.log(`Server listening on port ${port}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/pokemon/:key', function(req , res){
    var key = req.params.key;

    getPokemon(key).then(resp => {
        res.json(resp);    
        res.end();   
    }).catch(err => {
        res.json('[{ error: not found }]');    
        res.end();
    });
});

app.get('/type/:key', function(req , res){
    var key = req.params.key;

    getPokemon(key).then(resp => {
        res.json(resp);    
        res.end();   
    }).catch(err => {
        res.json('[{ error: not found }]');    
        res.end();
    });
});


function getPokemon(key) {
    return new Promise((resolve, reject) => {
        request({
                    method: 'GET',
                    uri: `https://pokeapi.co/api/v2/pokemon/${key}/`,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, function(error, response, res_body) {
            var parsedresponse = JSON.parse(res_body);
            if(error != null  || response.statusCode != 200) {
                console.error(error);
                reject({"error": error});
            }
            else {
                resolve(response);
            }
        });
    });
}