const env = require('dotenv')
const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const cors = require('cors')
const classroomsRouter = require('./routes/classroom')
const sessionRouter = require('./routes/session')
const subjectRouter = require('./routes/subject')
const userRouter = require('./routes/user')
const timetableRouter = require('./routes/timetable')

env.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const supabase = createClient(process.env.DATABASE_URL, process.env.DATABASE_KEY_SECRET, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

// middleware
app.use((req, res, next) => {
  req.supabase = supabase
  next()
})

app.use('/classrooms', classroomsRouter)
app.use('/session', sessionRouter)
app.use('/subject', subjectRouter)
app.use('/user', userRouter)
app.use('/timetable', timetableRouter)

app.get('/', (_, response) => response.json({ info: 'Node.js, Express, and Postgres API' }))

app.listen(process.env.PORT, () =>
  console.log(
    new Date().toLocaleTimeString() + `: Server is running on port ${process.env.PORT}...`
  )
)
