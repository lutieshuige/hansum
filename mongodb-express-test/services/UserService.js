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
    }
}
module.exports = UserService