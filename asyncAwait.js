'use strict';

const PokemonService = require('./pokemon_service');
const pokemonService = new PokemonService();
const args = require('minimist')(process.argv.slice(2));
const pokemonId = (args.p || args.pokemon || 1);

if (args.s || args.simple) {
  simple();
}
if (args.a || args.advanced) {
  advanced();
}

async function simple() {
  console.time('simple');
  let pokemon;
  try {
    pokemon = await pokemonService.getByIdAsync(pokemonId);
    delete pokemon.moves;
    delete pokemon.game_indices;
  } catch (err) {
    throw err;
  }
  console.timeEnd('simple');
  console.info(JSON.stringify(pokemon, null, 2));
}

async function advanced() {
  console.time('advanced');
  let pokemon;
  try {
    pokemon = await pokemonService.getByIdAsync(pokemonId);
    delete pokemon.moves;
    delete pokemon.game_indices;
  } catch (err) {
    throw err;
  }
  let abilityRequests = pokemon.abilities.map(ability => {
    return pokemonService.getAbilityPromise(ability.ability.url);
  });
  let abilities;
  try {
    abilities = await Promise.all(abilityRequests);
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
}