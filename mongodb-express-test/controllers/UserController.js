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
    },
    updateUser: async (req, res, next) => {
        console.log(req.body, req.params)
        const { username } = req.body
        const { id } = req.params
        await UserService.updateUser(username, id)
        res.send({
            ok: 1
        })
    },
    login: async (req, res, next) => {
        const { username, password } = req.body
        const data = await UserService.login(username, password)
        console.log(data);
        if(data.length === 0) {
            res.send({
                ok:0
            })
        } else {
            res.send({
                ok:1
            })
        }
    }
}

module.exports = UserController