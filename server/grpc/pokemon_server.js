/*
 *
 * Copyright 2018 Jacopo Mangiavacchi.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var request = require("request-promise");
  
var PROTO_PATH = __dirname + '/pokemon.proto';

var fs = require('fs');
var parseArgs = require('minimist');
var path = require('path');
var _ = require('lodash');
var grpc = require('grpc');
var pokebot = grpc.load(PROTO_PATH).pokebot;


async function searchPokemon(call) {
  let name = call.request.name;
  var options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
  };

  try {
    options.uri = `https://pokeapi.co/api/v2/pokemon/${name}/`;

    let response = await request(options);
    call.write(getPokemon(response));
  }
  catch (error) {
    try {
      options.uri = `https://pokeapi.co/api/v2/type/${name}/`;

      let response = await request(options);
      let resp = JSON.parse(response);
      await Promise.all(resp.pokemon.map(async p => {
        options.uri = `https://pokeapi.co/api/v2/pokemon/${p.pokemon.name}/`;

        let response = await request(options);
        call.write(getPokemon(response));   
      }))
    }
    catch (error) {
      console.log(error);
    }
  }

  call.end();
}

function getPokemon(response) {
  let resp = JSON.parse(response);

  var types = [];
  resp.types.forEach(element => {
      types.push(element.type.name);
  });

  var species = resp.species.name;

  return {
              "id": resp.id,
              "name": resp.name,
              "height": resp.height,
              "weight": resp.weight,
              "types": types,
              "thumbnail": `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${resp.id}.png`,
              "image": `https://img.pokemondb.net/artwork/${resp.name}.jpg`
              //"habitats" : "habitats",
              //"flavorText" : "flavorText"
          };
}

/**
 * Get a new server with the handler functions in this file bound to the methods
 * it serves.
 * @return {Server} The new server object
 */
function getServer() {
  var server = new grpc.Server();

  server.addService(pokebot.PokeBot.service, {
    searchPokemon: searchPokemon
  });
  return server;
}

if (require.main === module) {
  // If this is run as a script, start a server on an unused port
  var routeServer = getServer();
  routeServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  routeServer.start();
}

exports.getServer = getServer;
