'use strict';

const request = require('request');
const requestPromise = require('request-promise-native');
const path = require('path');

module.exports = class PokemonService {
  /**
   *
   * @param {Number} (version)
   */
  constructor(version) {
    this.url = `pokeapi.co/api/v${version || 2}`;
    this.errors = {
      NO_POKEMON_BY_ID: (id) => {
        return new Error(`no pokemon with id ${id}`)
      },
      NO_ABILITY: (url) => {
        return new Error(`no ability at url: ${url}`);
      }
    }
  }

  /**
   *
   * @param {Number} id
   * @param {Function} callback
   * @callback callback
   */
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
        callback(this.errors.NO_POKEMON_BY_ID(id));
        return;
      }
      callback(null, body);
    });
  }

  /**
   *
   * @param {Number} id
   * @returns {PromiseLike<T> | Promise<T>}
   */
  getByIdPromise(id) {
    return requestPromise.get('https://' + path.join(this.url, 'pokemon', id.toString()))
    .then(body => {
      if (!body) {
        return this.errors.NO_POKEMON_BY_ID(id);
      }
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return this.errors.NO_POKEMON_BY_ID(id);
      }
      return body;
    });
  }

  async getByIdAsync(id) {
    return this.getByIdPromise(id);
  }

  getAbilityCallback(abilityUrl, callback) {
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
        callback(this.errors.NO_ABILITY(abilityUrl));
        return;
      }
      callback(null, body);
    });
  }

  getAbilityPromise(abilityUrl) {
    return requestPromise.get(abilityUrl)
      .then(body => {
        if (!body) {
          return this.errors.NO_ABILITY(abilityUrl);
        }
        try {
          body = JSON.parse(body);
        } catch (parseErr) {
          return this.errors.NO_ABILITY(abilityUrl);
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