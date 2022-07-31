var express = require('express');
const UserModel = require('../model/UserModel');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.post('/user/add', (req, res, next) => {
  console.log(req.body);
  const { username, password, age } = req.body
  // 插入数据库
  UserModel.create({
    username,
    password,
    age
  }).then((data) => {
    console.log(data);
  })
  res.send({
    ok: 1
  })
})
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

