const test = require('express').Router()

// Retrieve all
test.get('/', function (req, res) {
    res.status(200).send('success!')
})


module.exports = test
