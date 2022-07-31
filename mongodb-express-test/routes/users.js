var express = require('express');
const UserController = require('../controllers/UserController');
const UserModel = require('../model/UserModel');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.post('/user/add', UserController.addUser)
router.post('/user/update/:id', (req, res, next) => {
  console.log(req.body, req.params)
  const { username } = req.body
  const { id } = req.params
  UserModel.updateOne({ _id: id }, {
    username
  }).then((data) => {
    res.send({
      ok: 1
    })
  })
  
})

module.exports = router;

