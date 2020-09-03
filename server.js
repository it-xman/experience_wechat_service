const express = require('express')
const {User} = require('./models')
const SECRET = 'xcr'
const app = express()
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    const raw = String(req.headers.authorization).split(' ').pop()

    const {id} = jwt.verify(raw, SECRET)
    // 错误处理

    req.user = await User.findById(id)

    next()
}

app.use(express.json())

app.get('/api/users', async (req, res) => {
    const users = await User.find();

    res.send(users)
})


app.post('/api/register', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username,
    })

    if (user) {
        return res.status(422).send({
            message: '用户名已存在，请重新输入',
        })
    }
    const nowUser = await User.create({
        username: req.body.username,
        password: req.body.password,
    })

    res.send({
        status: 200,
        message: '注册成功'
    })
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username,
    })

    if (!user) {
        return res.status(422).send({
            message: '用户名不存在',
        })
    }
    const isPasswordValid = require('bcrypt').compareSync(
        req.body.password,
        user.password,
    )

    if (!isPasswordValid) {
        return res.status(422).send({
            message: '密码无效',
        })
    }

    // 生成token
    const token = jwt.sign({id: String(user._id)}, SECRET)

    res.send({
        status: 200,
        message: '登录成功',
        token: token,
    })
})

app.get('/api/userInfo', auth, async (req, res) => {
    res.send(req.user)
})


app.listen(3000, () => {
    console.log('http://localhost:3000')
})
