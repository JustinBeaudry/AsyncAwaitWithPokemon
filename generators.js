'use strict';

/**
 * Based on:
 * https://davidwalsh.name/async-generators
 */

const PokemonService = require('./pokemon_service');
const pokemonService = new PokemonService();
const args = require('minimist')(process.argv.slice(2));

if (args.s || args.simple) {
  simple();
}
if (args.a || args.advanced) {
  advanced();
}

function simple() {
  console.time('simple');
  pokemonService.runner(function *generator() {
    let pokemon;
    try {
      pokemon = yield pokemonService.getByIdPromise(1);
      delete pokemon.moves;
      delete pokemon.game_indices;
    } catch(err) {
      throw err;
    }
    console.timeEnd('simple');
    console.info(JSON.stringify(pokemon, null, 2));
    process.exit();
  });
}

function advanced() {
  console.time('advanced');
  pokemonService.runner(function *generator() {
    let pokemon;
    try {
      pokemon = yield pokemonService.getByIdPromise(1);
      delete pokemon.moves;
      delete pokemon.game_indices;
    } catch(err) {
      throw err;
    }
    let abilityRequests = pokemon.abilities.map(ability => {
      return pokemonService.getPokemonAbilityPromise(ability.ability.url);
    });
    let abilities;
    try {
      abilities = yield Promise.all(abilityRequests);
      abilities.map(ability => {
        delete ability.pokemon;
        delete ability.names;
        delete ability.flavor_text_entries;
        return ability;
      });
    } catch(err) {
      throw err;
    }
    pokemon.abilities = abilities;
    console.timeEnd('advanced');
    console.info(JSON.stringify(pokemon, null, 2));
    process.exit();
  });
}
