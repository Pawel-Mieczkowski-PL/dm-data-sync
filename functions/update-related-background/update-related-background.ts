import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from '../update/update'
import { log } from 'console'

export const handler: Handler = async (event, context) => {
  {

    const _sanity = sanity // configured Sanity client
    const _sanityAlgolia = sanityAlgolia // configured sanity-algolia
    const eventBody = JSON.parse(event.body)

    // Fetch the _id of all the documents we want to index
    const relatedTypes = ['seller', 'designer', 'category']
    const types = ['product']
    const relatedIds = JSON.stringify(JSON.parse(event.body).ids?.updated)
    console.log('relatedIds', relatedIds)
    //const query = `* [_type in $types && references("${relatedIds}") &&!(_id in path("drafts.**"))][]._id`
    const query = `* [_id in ${relatedIds}][]{
      _type in ["designer","seller","materials"] => {
        "ids":*[_type=='product' && references(^._id) &&!(_id in path("drafts.**"))]._id
      },
      _type == "featuredCollection" => {
        "ids":products[] -> _id
      },
      _type == "event" => {
        "programs":*[_type=='program' && references(^._id)]{
          "ids":*[_type=='product' && references(^._id) &&!(^._id in path("drafts.**"))][]._id
        }
      }
    }`

    try {
      const response = await _sanity.fetch(query, { types })
      // const { ids } = response[0]
      const syncIds = response.map((id) => {
        if (id.programs != null && id.programs != undefined) {
          let programs = id.programs
            .map((program) => {
              return program.ids
            })
            .filter(function (element) {
              return element !== undefined
            })
            .join(',')
          return programs
        }
        if (!Object.is(id.ids, null) && !Object.is(id.ids, undefined)) {
          return id.ids
        }
      })[0]
      console.log('syncIds', syncIds)

      // const outputIds = ids.map((id) => {
      //   if (id.programs != null && id.programs != undefined) {
      //     let programs = id.programs
      //       .map((program) => {
      //         return program.ids.map((i) => `"${i}"`).join(',')
      //       })
      //       .filter(function (element) {
      //         return element !== undefined
      //       })
      //       .join(',')
      //     return programs
      //   }
      //   if (!Object.is(id.ids, null) && !Object.is(id.ids, undefined)) {
      //     return id.ids.map((i) => `"${i}"`).join(',')
      //   }
      // })

      const body = {
        ...eventBody,
        "ids": {
          "created": [],
          "deleted": [],
          "updated": syncIds
        }
      }
      console.log('body', body.ids)
      await _sanityAlgolia.webhookSync(_sanity, body)
      return {
        statusCode: 200,
        body: 'ok',
      }
    } catch (err) {
      console.log('err', err)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err }),
      }
    }

    return null;


    return _sanity
      .fetch(query, { types })
      .then((ids) => {
        console.log(ids)
        let outputIds = ids
          .map((id) => {
            if (id.programs != null) {
              let programs = id.programs
                .map((program) => {
                  return program.ids
                  // return program.ids.map((i) => `"${i}"`).join(',')
                })
                .filter(function (element) {
                  return element !== undefined
                })
                .join(',')
              return programs
            }
            if (!Object.is(id.ids, null) && !Object.is(id.ids, undefined)) {
              // return id.ids.map((i) => `"${i}"`).join(',')
              return id.ids
            }
          })
          .filter(function (element) {
            return element !== undefined
          })

        const body = {
          ...eventBody,
          "ids": {
            "created": [],
            "deleted": [],
            "updated": outputIds
          }
        }
        console.log('body', body.ids)
        _sanityAlgolia.webhookSync(_sanity, body)
      })
      .then(() => {
        return {
          statusCode: 200,
          body: 'ok',
        }
      })
      .catch((err) => {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: err }),
        }
      })
  }
}
