'use strict';

const PokemonService = require('./pokemon_service');
const pokemonService = new PokemonService();
const async = require('async');
const args = require('minimist')(process.argv.slice(2));

if (args.s || args.simple) {
  simple();
}
if (args.a || args.advanced) {
  advanced();
}

function simple() {
  console.time('simple');
  pokemonService.getByIdCallback(1, (err, pokemon) => {
    if (err) {
      throw err;
    }
    delete pokemon.moves;
    delete pokemon.game_indices;
    console.timeEnd('simple');
    console.info(JSON.stringify(pokemon, null, 2));
  });
}

function advanced() {
  console.time('advanced');
  pokemonService.getByIdCallback(1, (getPokemonError, pokemon) => {
    if (getPokemonError) {
      throw getPokemonError;
    }
    delete pokemon.moves;
    delete pokemon.game_indices;
    async.map(pokemon.abilities, (ability, nextAbility) => {
      console.info(ability);
      pokemonService.getPokemonAbilityCallback(ability.ability.url, nextAbility);
    }, (getAbilityError, abilities) => {
      if (getAbilityError) {
        throw getAbilityError;
      }
      abilities.map(ability => {
        delete ability.pokemon;
        delete ability.names;
        delete ability.flavor_text_entries;
        return ability;
      });
      pokemon.abilities = abilities;
      console.timeEnd('advanced');
      console.info(JSON.stringify(pokemon, null, 2));
    });
  });
}
