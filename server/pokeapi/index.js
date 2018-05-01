const express = require('express');
const app = express();
const request = require('request'); 
const Promise = require('es6-promise').Promise;
const bodyParser  = require("body-parser");
const NodeCache = require( "node-cache" );

const ApiEnum = {
    POKEMON: 1,
    HABITAT: 2,
    TYPE: 3,
};

const pokemonCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const habitatCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const typeCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

const port = 4000

app.listen(port, function(){
    console.log(`Server listening on port ${port}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/pokemon/:key', function(req , res){
    var key = req.params.key;
    var pokemon = {}

    callPokeAPI(ApiEnum.POKEMON, key).then(resp => {
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

        return callPokeAPI(ApiEnum.HABITAT, species);
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

    callPokeAPI(ApiEnum.TYPE, key).then(resp => {
        var pokemons = [];
        resp.pokemon.forEach(element => {
            pokemons.push(element.pokemon.name);
        });

        res.json(pokemons);    
        res.end();   
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            message: 'Error!'
         });
        res.end();
    });
});


function callPokeAPI(apiEnum, key) {
    var cache = null;
    var apiCommand = null;
    switch(apiEnum) {
        case ApiEnum.POKEMON: {
            cache = pokemonCache;
            apiCommand = "pokemon";
            break;
        }
        case ApiEnum.HABITAT: {
            cache = habitatCache;
            apiCommand = "pokemon-species";
            break;
        }
        case ApiEnum.TYPE: {
            cache = typeCache;
            apiCommand = "type";
            break;
        }
        default: {
            console.log("wrong type");
            throw "wrong type"; 
        }
    }

    value = cache.get(key);
    if ( value == undefined ){
        return new Promise((resolve, reject) => {
            console.log(`searching ${apiCommand} ${key}`)

            request({
                        method: 'GET',
                        uri: `https://pokeapi.co/api/v2/${apiCommand}/${key}/`,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }, function(error, response, res_body) {
                if(error != null  || response.statusCode != 200) {
                    console.error(error);
                    reject({"error": error});
                }
                else {
                    var o = JSON.parse(response.body);
                    cache.set(key, o);
                    resolve(o);
                }
            });
        });
    }
    else {
        return new Promise((resolve, reject) => {
            console.log(`found ${apiCommand} ${key}`)
            resolve(value);
        });
    }
}

