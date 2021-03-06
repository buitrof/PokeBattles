const router = require('express').Router()
const { Pokemon } = require('../models')
const pokemonGif = require('pokemon-gif')
// bring in Op to do an OR statement
const { Op } = require('sequelize')

// get all pokemon
router.get('/pokemons', (req, res) => {
  Pokemon.findAll()
    .then(pokemon => {
      res.json(pokemon)
    })
    .catch(error => res.sendStatus(400))
})

// get pokemon by id
router.get('/pokemons/:name', (req, res) => {
  Pokemon.findOne({ where: { name: req.params.name } })
    .then(pokemon => {
      // getting the pokedex number
      const pokedexNum = pokemon.dataValues.pokedex_number
      pokemon.dataValues.sprite = pokemonGif(pokedexNum).toLowerCase()
      res.json(pokemon)
    })
    .catch(error => res.sendStatus(400))
})

// get pokemon by its id and returns its name
router.get('/pokemons/id/:id', (req, res) => {
  Pokemon.findOne({ where: { id: req.params.id }, attributes: ['name'] })
    .then(pokemon => {
      res.json(pokemon)
    })
    .catch(error => res.sendStatus(400))
})
// get pokemon matchups (all pokemon)
router.get('/pokemons/matchups/:name', (req, res) => {
  // getting inital pokemon to generate matchups against
  Pokemon.findAll({ where: { name: req.params.name }, attributes: ['base_total', 'against_bug', 'against_dark', 'against_dragon', 'against_electric', 'against_fairy', 'against_fight', 'against_fire', 'against_flying', 'against_ghost', 'against_grass', 'against_ground', 'against_ice', 'against_normal', 'against_poison', 'against_psychic', 'against_rock', 'against_steel', 'against_water'] })
    .then(pokemon => {
      const matchups = pokemon[0].dataValues
      // getting all pokemon within the a 100 base stat range
      const base_total = matchups.base_total - 150
      // remove the key base_total
      delete matchups.base_total
      let goodMatchups = []
      let badMatchups = []
      for (const element in matchups) {
        if (matchups[element] >= 2) {
          goodMatchups.push(element)
        } else if (matchups[element] < 1) {
          badMatchups.push(element)
        }
      }
      // mapping to take out against_
      goodMatchups = goodMatchups.map(element => {
        element = element.split('_')
        // accomodate for against_fight
        if (element[1] === 'fight') {
          element[1] = 'fighting'
        }
        return element[1]
      })
      badMatchups = badMatchups.map(element => {
        element = element.split('_')
        if (element[1] === 'fight') {
          element[1] = 'fighting'
        }
        return element[1]
      })
      // serach for pokemon based on goodMatchups
      Pokemon.findAll({
        where: {
          base_total: {
            [Op.gte]: base_total
          },
          [Op.or]: [
            {
              // checks if anything in the goodmatchups is in the type1 column AND nothing in the badmatchups appear in the type2 column
              type1: goodMatchups,
              [Op.and]: [{ type2: { [Op.not]: badMatchups } }]
            },
            {
              // checks if anything in the goodmatchups is in the type2 column AND nothing in the badmatchups appear in the type1 column
              type2: goodMatchups,
              [Op.and]: [{ type1: { [Op.not]: badMatchups } }]
            }
          ]
        },
        attributes: ['name', 'pokedex_number', 'base_total', 'hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed', 'type1', 'type2'],
        order: [['base_total', 'DESC']]
      })
        .then(results => {
          for (let i = 0; i < results.length; i++) {
          // getting the pokedex number
            const pokedexNum = results[i].dataValues.pokedex_number
            // edge case for 3 pokemon with incorrect image links
            results[i].dataValues.sprite = pokemonGif(pokedexNum).toLowerCase()
          }
          res.json(results)
        })
        .catch(error => res.sendStatus(400))
    })
    .catch(error => res.sendStatus(400))
})
// create a pokemon
router.post('/pokemons', (req, res) => {
  Pokemon.create(req.body)
    .then(() => res.sendStatus(200))
    .catch(error => res.sendStatus(400))
})

// get pokemon matchups (no legendaries)
router.get('/pokemons/matchups/nl/:name', (req, res) => {
  // getting inital pokemon to generate matchups against
  Pokemon.findAll({ where: { name: req.params.name }, attributes: ['base_total', 'against_bug', 'against_dark', 'against_dragon', 'against_electric', 'against_fairy', 'against_fight', 'against_fire', 'against_flying', 'against_ghost', 'against_grass', 'against_ground', 'against_ice', 'against_normal', 'against_poison', 'against_psychic', 'against_rock', 'against_steel', 'against_water'] })
    .then(pokemon => {
      const matchups = pokemon[0].dataValues
      // getting all pokemon within the a 100 base stat range
      const base_total = matchups.base_total - 150
      // remove the key base_total
      delete matchups.base_total
      let goodMatchups = []
      let badMatchups = []
      for (const element in matchups) {
        if (matchups[element] >= 2) {
          goodMatchups.push(element)
        } else if (matchups[element] < 1) {
          badMatchups.push(element)
        }
      }
      // mapping to take out against_
      goodMatchups = goodMatchups.map(element => {
        element = element.split('_')
        // accomodate for against_fight
        if (element[1] === 'fight') {
          element[1] = 'fighting'
        }
        return element[1]
      })
      badMatchups = badMatchups.map(element => {
        element = element.split('_')
        if (element[1] === 'fight') {
          element[1] = 'fighting'
        }
        return element[1]
      })

      // serach for pokemon based on goodMatchups

      Pokemon.findAll({
        where: {
          base_total: {
            [Op.gte]: base_total
          },
          is_legendary: {
            [Op.not]: true
          },
          [Op.or]: [
            {
              // checks if anything in the goodmatchups is in the type1 column AND nothing in the badmatchups appear in the type2 column
              type1: goodMatchups,
              [Op.and]: [{ type2: { [Op.not]: badMatchups } }]
            },
            {
              // checks if anything in the goodmatchups is in the type2 column AND nothing in the badmatchups appear in the type1 column
              type2: goodMatchups,
              [Op.and]: [{ type1: { [Op.not]: badMatchups } }]
            }
          ]
        },
        attributes: ['name', 'pokedex_number', 'base_total', 'hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed', 'type1', 'type2'],
        order: [['base_total', 'DESC']]
      })
        .then(results => {
          for (let i = 0; i < results.length; i++) {
            // getting the pokedex number
            const pokedexNum = results[i].dataValues.pokedex_number
            // edge case for 3 pokemon with incorrect image links
            results[i].dataValues.sprite = pokemonGif(pokedexNum).toLowerCase()
          }
          res.json(results)
        })
        .catch(error => res.sendStatus(400))
    })
    .catch(error => res.sendStatus(400))
})
// create a pokemon
router.post('/pokemons', (req, res) => {
  Pokemon.create(req.body)
    .then(() => res.sendStatus(200))
    .catch(error => res.sendStatus(400))
})

// update a pokemon
router.put('/pokemons/:name', (req, res) => {
  Pokemon.update(req.body, { where: { name: req.params.name } })
    .then(() => res.sendStatus(200))
    .catch(error => res.sendStatus(400))
})

// delete a pokemon
router.delete('/pokemons/:name', (req, res) => {
  Pokemon.destroy({ where: { name: req.params.name } })
    .then(() => res.sendStatus(200))
    .catch(error => res.sendStatus(400))
})

module.exports = router
