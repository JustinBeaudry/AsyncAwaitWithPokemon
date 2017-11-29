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

function simple() {
  console.time('simple');
  pokemonService.getByIdPromise(pokemonId)
    .then(pokemon => {
      delete pokemon.moves;
      delete pokemon.game_indices;
      console.timeEnd('simple');
      console.info(JSON.stringify(pokemon, null, 2));
    })
    .catch(err => {
      console.timeEnd('simple');
      console.error(err);
    });
}

function advanced() {
  console.time('advanced');
  pokemonService.getByIdPromise(pokemonId)
    .then(pokemon => {
      delete pokemon.moves;
      delete pokemon.game_indices;
      let abilityRequests = pokemon.abilities.map(ability => {
        return pokemonService.getAbilityPromise(ability.ability.url);
      });
      return Promise.all(abilityRequests)
        .then(abilities => {
          abilities.map(ability => {
            delete ability.pokemon;
            delete ability.names;
            delete ability.flavor_text_entries;
            return ability;
          });
          pokemon.abilities = abilities;
          return pokemon;
        });
    })
    .then(pokemon => {
      console.timeEnd('advanced');
      console.info(JSON.stringify(pokemon, null, 2));
    })
    .catch(err => {
      console.timeEnd('advanced');
      console.error(err);
    });
}
