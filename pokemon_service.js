'use strict';

const request = require('request');
const requestPromise = require('request-promise-native');
const path = require('path');

module.exports = class PokemonService {
  constructor() {
    this.url = 'pokeapi.co/api/v2/';
    this.errors = {
      NO_POKEMON_BY_ID: (id) => {
        return new Error(`no pokemon with id ${id}`)
      },
      NO_ABILITY: (url) => {
        return new Error(`no ability at url: ${url}`);
      }
    }
  }

  getByIdCallback(id, callback) {
    request.get('https://' + path.join(this.url, 'pokemon', id.toString()), (err, response, body) => {
      if (err) {
        callback(err);
        return;
      }
      if (!body) {
        callback(this.errors.NO_POKEMON_BY_ID(id));
        return;
      }
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        callback(parseErr);
        return;
      }
      callback(null, body);
    });
  }

  getByIdPromise(id) {
    return requestPromise.get('https://' + path.join(this.url, 'pokemon', id.toString()))
    .then(body => {
      if (!body) {
        return this.errors.NO_POKEMON_BY_ID(id);
      }
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return parseErr;
      }
      return body;
    });
  }

  async getByIdAsync(id) {
    return this.getByIdPromise(id);
  }

  getPokemonAbilityCallback(abilityUrl, callback) {
    request.get(abilityUrl, (err, response, body) => {
      if (err) {
        callback(err);
        return;
      }
      if (!body) {
        callback(this.errors.NO_ABILITY(abilityUrl));
        return;
      }
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        callback(parseErr);
        return;
      }
      callback(null, body);
    });
  }

  getPokemonAbilityPromise(abilityUrl) {
    return requestPromise.get(abilityUrl)
      .then(body => {
        if (!body) {
          return this.errors.NO_ABILITY(abilityUrl);
        }
        try {
          body = JSON.parse(body);
        } catch (parseErr) {
          return parseErr;
        }
        return body;
      });
  }

  runner(generator) {
    let it = generator(), ret;

    (function iterate(value) {
      ret = it.next(value);

      if (!ret.done) {
        // is it a promise?
        if ("then" in ret.value) {
          ret.value.then(iterate);
        }
      } else {
        // avoid recursion
        process.nextTick(() => {
          iterate(ret.value);
        });
      }
    })();
  }
}