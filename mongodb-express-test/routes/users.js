var express = require('express');
const UserController = require('../controllers/UserController');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.post('/user/add', UserController.addUser)
router.post('/user/update/:id', UserController.updateUser)
router.post('/login',UserController.login)

module.exports = router;

