import 'dotenv/config'
import { createApp } from './app'
import { getEnv } from './env'

const env = getEnv()
const app = createApp()

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`)
})
