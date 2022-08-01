const UserModel = require("../model/UserModel");

const UserService = {
    addUser: (username,password,age) => {
        return UserModel.create({
            username,
            password,
            age
        }).then((data) => {
            console.log(data);
        })
    },
    updateUser: (username,id) => {
        return UserModel.updateOne({ _id: id }, {
            username
        }).then((data) => {
            
        })
    },
    login: (username, password) => {
      return UserModel.find({username,password})
    }
}
module.exports = UserService