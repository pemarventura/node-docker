const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const redis = require("redis")
let RedisStore = require("connect-redis")(session)
const cors = require("cors")
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require("./config/config")
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
})
const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")
const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose.connect(mongoURL).then(()=> console.log("connected to database")).catch(()=>{
        console.log("unable to connect to database")
        setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()
app.enable("trust proxy")
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000
    }
}))

app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h2>Hi there!!!!!!</h2>")
})

app.use("/posts", postRouter)
app.use("/users", userRouter)
const port = process.env.port || 3000;

app.listen(port, () => console.log(`listening on ${port}`))