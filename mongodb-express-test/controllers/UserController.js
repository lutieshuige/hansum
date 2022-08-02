const UserService = require("../services/UserService");
const JWT = require("../utils/JWT");

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
        console.log(data[0]);
        if (data.length === 0) {
            res.send({
                ok: 0
            })
        } else {
            // 设置 session
            req.session.user = data[0]
            // 设置token
            const {_id, username} = data[0]
            const token = JWT.generator({
                _id,
                username
            },'1h')
            // token 返回在header中
            res.header('Authorization', token)
            res.send({
                ok: 1
            })
        }
    }
}

module.exports = UserController