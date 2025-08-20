// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive, createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from '../env'

const token = process.env.SANITY_API_READ_TOKEN;
if(!token) {
  throw new Error("SANITY_API_READ_TOKEN is not set");
}

// Create client directly here to avoid circular dependency
const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

export const { sanityFetch, SanityLive } = defineLive({
  client: liveClient,
  serverToken: token,
  browserToken: token,
})