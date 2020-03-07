const router = require('express').Router()
const { User, Team, Pokemon } = require('../models')

// GET all users
router.get('/users', (req, res) =>{
  User.findAll({include: [{
      model: Team,
    include: [
      { model: Pokemon, as: 'pokemon1', attributes: ['name', 'id'] },
      { model: Pokemon, as: 'pokemon2', attributes: ['name', 'id'] },
      { model: Pokemon, as: 'pokemon3', attributes: ['name', 'id'] },
      { model: Pokemon, as: 'enemy1', attributes: ['name', 'id'] },
      { model: Pokemon, as: 'enemy2', attributes: ['name', 'id'] },
      { model: Pokemon, as: 'enemy3', attributes: ['name', 'id'] }]
    }]
  })
  .then(users => res.json(users))
  .catch(e => res.sendStatus(400))
}) 

// GET one user
router.get('/users/:username', (req, res) => User.findOne({
  where: {
    username: req.params.username
  },
  include: [{
    model: Team,
    include: [
    { model: Pokemon, as: 'pokemon1', attributes: ['name', 'id'] }, 
    { model: Pokemon, as: 'pokemon2', attributes: ['name', 'id'] }, 
    { model: Pokemon, as: 'pokemon3', attributes: ['name', 'id'] }, 
    { model: Pokemon, as: 'enemy1', attributes: ['name', 'id'] }, 
    { model: Pokemon, as: 'enemy2', attributes: ['name', 'id'] }, 
    { model: Pokemon, as: 'enemy3', attributes: ['name', 'id'] }
  ]
  }]
})
  .then(user => res.json(user))
  .catch(e => res.sendStatus(400)))

// POST a user
router.post('/users', (req, res) => User.create(req.body)
  //send back user data
  .then( user => res.json(user))
  .catch(e => res.sendStatus(400))
)
// PUT a user
router.put('/users/:username', (req, res) => User.update(req.body, {
  where: {
    username: req.params.username
  },
  include: [Team]
})
  .then(user => res.sendStatus(200))
  .catch(e => res.sendStatus(400)))

// DELETE a user
router.delete('/users/:username', (req, res) => User.destroy({
  where: {
    username: req.params.username
  }
})
  .then(user => res.sendStatus(200))
  .catch(e => res.sendStatus(400))
)

module.exports = router