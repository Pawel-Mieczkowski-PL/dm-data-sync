import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from '../update/update'

export const handler: Handler = async (event, context) => {
  {

    const destination = 'https://dm-data-sync.netlify.app/.netlify/functions/testd'
    const timeout = 15 // seconds
    const sleep = (seconds) =>
      Promise.resolve(() => setTimeout(resolve, +seconds * 1000))

    // Simulating fake long running sequence
    console.log(
      `[INIT] Beginning to process data. This may take a while ~${timeout} seconds...`
    )
    await sleep(timeout) // seconds
    console.log(`[SUCCESS] Done processing after ${timeout} seconds...`)
    console.log(`Sending data to destination: ${destination}...`)

    // Sending data to a destination
    fetch(destination, {
      method: "POST",
      body: JSON.stringify({
        message: `Successfully processed request with ID: ${Math.random() * 1000
          }`,
        date: new Date().toGMTString(),
      }),
    })
  }
}
