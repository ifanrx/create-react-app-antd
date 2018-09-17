import axios from 'axios'

const client = axios.create({
  baseURL: 'https://cloud.minapp.com/userve/v1/',// user dash api 的请求地址
  withCredentials: true // 必须手动开启为 true，允许跨域请求发送身份凭证信息
})

export default {
  schema: {
    getSchema(id) {
      return client.get(`table/${id}/`)
    },
    getRecord(id, {offset = 0, limit = 20}) {
      return client.get(`table/${id}/record/`, {
        params: {
          offset, limit
        }
      })
    },
    create(newSchema) {
      if (!newSchema.schema) {
        newSchema.schema = {}
      }
      return client.post('schema/', newSchema, {
        baseURL: '/dserve/v1.5/',
      })
    },
    query() {

    },
    deleteRow(schemaID, id) {
      return client.delete(`table/${schemaID}/record/${id}/`)
    },
    updateSchema(schemaID, params) {
      return client.put(`schema/${schemaID}/`, params)
    }
  },
  file: {
    upload() {

    },
    getUploadConfig() {

    }
  }
}