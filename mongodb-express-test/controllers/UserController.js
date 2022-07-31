const UserService = require("../services/UserService");

const UserController = {
    addUser: async (req, res, next) => {
        console.log(req.body);
        const { username, password, age } = req.body
        // 插入数据库
        await UserService.addUser(username, password, age)
        res.send({
            ok: 1
        })
    }
}

module.exports = UserController