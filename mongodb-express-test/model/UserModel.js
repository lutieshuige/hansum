const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userType = {
    username:String,
    password:String,
    age:Number
}

const UserModel = mongoose.model('user',new Schema(userType))

module.exports = UserModel