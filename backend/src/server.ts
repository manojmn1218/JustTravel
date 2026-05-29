import 'dotenv/config'
import { createApp } from './app'
import { getEnv } from './env'

const env = getEnv()
const app = createApp()

app.listen(env.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://0.0.0.0:${env.PORT}`)
})
