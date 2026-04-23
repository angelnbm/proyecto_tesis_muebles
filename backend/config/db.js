const mongoose = require('mongoose')

const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/furniture_db'

const globalScope = globalThis

if (!globalScope.__mongooseConnectionCache) {
  globalScope.__mongooseConnectionCache = {
    connection: null,
    promise: null,
    uri: null,
  }
}

function resolveMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI
  }

  if ((process.env.NODE_ENV || 'development') !== 'production') {
    return LOCAL_MONGODB_URI
  }

  return null
}

async function connectToDatabase() {
  const uri = resolveMongoUri()

  if (!uri) {
    throw new Error('Falta la variable MONGODB_URI en entorno de produccion')
  }

  const cache = globalScope.__mongooseConnectionCache

  if (cache.connection && cache.uri === uri && mongoose.connection.readyState === 1) {
    return cache.connection
  }

  if (cache.promise && cache.uri === uri) {
    return cache.promise
  }

  cache.uri = uri
  cache.promise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
  })
    .then((instance) => {
      cache.connection = instance.connection
      return cache.connection
    })
    .catch((error) => {
      cache.promise = null
      cache.connection = null
      throw error
    })

  return cache.promise
}

module.exports = {
  connectToDatabase,
}
