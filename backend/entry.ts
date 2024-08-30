import { config } from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'


config({ path: '.env' })
const { BE_PORT } = process.env
const MIN_DELAY = 1
const MAX_DELAY = 1000
const MAX_REQUESTS = 50
const WINDOW_IN_MS = 1000


const app = express()
const requestMap = new Map()


const rateLimiter = ({ ip }: Request, res: Response, next: NextFunction) => {
  const currentTime = Date.now()

  if (requestMap.has(ip)) {
    const requestData = requestMap.get(ip)

    if (currentTime - requestData.firstRequestTimestamp < WINDOW_IN_MS) {
      requestData.count += 1

      if (requestData.count > MAX_REQUESTS) {
        return res.sendStatus(429)
      }
    } else {
      requestData.count = 1
      requestData.firstRequestTimestamp = currentTime
    }
  } else {
    requestMap.set(ip, { count: 1, firstRequestTimestamp: currentTime })
  }

  next()
}

app.use(rateLimiter)
app.use(bodyParser.text({ type: 'text/plain' }))


app.get('*', express.static('.'))

app.post('/api', async (req: Request<unknown, unknown, string>, res) => {
  const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY
  setTimeout(() => res.status(200).send(req.body), delay)
})


app.listen(BE_PORT, () => console.log(`App is listening on port ${BE_PORT}`))
