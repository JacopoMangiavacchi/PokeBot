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
    var pokemon = {}

    getPokemon(key).then(resp => {
        var types = [];
        resp.types.forEach(element => {
            types.push(element.type.name);
        });

        var species = resp.species.name;

        pokemon = {
                    "id": resp.id,
                    "name": resp.name,
                    "height": resp.height,
                    "weight": resp.weight,
                    "types": types,
                    "thumbnail": `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${resp.id}.png`,
                    "image": `https://img.pokemondb.net/artwork/${resp.name}.jpg`
                };

        return getHabitats(species);
    }).then(resp => {
        pokemon.habitats = resp.habitat.name;

        var flavors = resp.flavor_text_entries;
        var flavorText = "";

        flavors.forEach(element => {
            if(element.language.name == "en") {
                flavorText = element.flavor_text.replace(/(?:\r\n|\r|\n|\f)/g, ' ');
            }
        });

        pokemon.flavorText = flavorText;

        res.json(pokemon);    
        res.end();   
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            message: 'Error!'
         });
        res.end();
    });
});

app.get('/type/:key', function(req , res){
    var key = req.params.key;

    getPokemon(key).then(resp => {
        console.log(resp.id);   
        console.log(resp.name);
        
        res.json(resp);    
        res.end();   
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            message: 'Error!'
         });
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
            if(error != null  || response.statusCode != 200) {
                console.error(error);
                reject({"error": error});
            }
            else {
                resolve(JSON.parse(response.body));
            }
        });
    });
}

function getHabitats(species) {
    return new Promise((resolve, reject) => {
        request({
                    method: 'GET',
                    uri: `https://pokeapi.co/api/v2/pokemon-species/${species}/`,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, function(error, response, res_body) {
            if(error != null  || response.statusCode != 200) {
                console.error(error);
                reject({"error": error});
            }
            else {
                resolve(JSON.parse(response.body));
            }
        });
    });
}
