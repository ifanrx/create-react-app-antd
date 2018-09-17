import axios from 'axios'

const client = axios.create({
  baseURL: 'https://cloud.minapp.com/userve/v1/',// user dash api 的请求地址
  withCredentials: true // 必须手动开启为 true，允许跨域请求发送身份凭证信息
})
let fileUploadClient = axios.create({})


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

    createRow(schemaID, data) {
      return client.post(`table/${schemaID}/record/`, data)
    },

    updateRow(schemaID, recordID, data) {
      return client.put(`table/${schemaID}/record/${recordID}/`, data)
    },
    query() {

    },
    deleteRow(schemaID, id) {
      return client.delete(`table/${schemaID}/record/${id}/`)
    },
  },
  file: {
    uploadFile(config, onUploadProgress) {
      let formData = new FormData()
      formData.append('file', config.file)
      formData.append('policy', config.policy)
      formData.append('authorization', config.authorization)
      return fileUploadClient.post(config.uploadUrl, formData, {
        'headers': {'Content-Type': 'multipart/form-data'},
        withCredentials: false,
        onUploadProgress,
      })
    },
    getUploadFileConfig(data) {
      return client.post('upload/', data)
    }  }
}