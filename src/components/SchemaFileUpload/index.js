import React from 'react'
import util from '../../utils'
import API from '../../io'
import constants from '../../constants'
import {
  Button,
  Icon,
  Upload,
  message
} from 'antd'

const fileTypeInvalidTip = '文件类型不合法'
const fileSizeInvalid = '请选择小于 30M 的文件'

export default class FileUpload extends React.Component {
  state = {
    fileUploadPayload: {}
  }

  componentDidMount() {
    let {value: fileUploadPayload} = this.props
    this.setState({
      fileUploadPayload: fileUploadPayload ? {
        id: fileUploadPayload.id,
        name: fileUploadPayload.name,
        created_at: fileUploadPayload.created_at,
        mime_type: fileUploadPayload.mime_type,
        size: fileUploadPayload.size,
        cdn_path: fileUploadPayload.cdn_path
      } : {}
    })
  }

  uploadFileProps = () => {
    let {value, setField, item, onRemove, disabled} = this.props
    return {
      disabled,
      customRequest: this.beforeUpload,
      onRemove: e => {
        this.setState({
          fileUploadPayload: {}
        })
        setField(null, item)
        return onRemove ? onRemove() : Promise.resolve(true)
      },
      defaultFileList: value ? [{
        uid: value.id,
        name: value.name,
        status: 'done',
        reponse: 'Server Error 500', // custom error message to show
        url: value.cdn_path
      }] : []
    }
  }

  beforeUpload = uploadObj => {
    this.uploadFile(uploadObj)
  }

  uploadFile = ({file, onProgress, onSuccess, onError}) => {
    if (util.checkUploadFileType(file.name)) {
      message.error(fileTypeInvalidTip)
      return setTimeout(() => {
        onError(new Error(fileTypeInvalidTip))
      }, 30)
    }

    if (file.size > constants.MAX_UPLOAD_SIZE) {
      message.error(fileSizeInvalid)

      return setTimeout(() => {
        onError(new Error(fileSizeInvalid), 30)
      })
    }

    API.file.getUploadFileConfig({
      filename: file.name
    }).then(res => {
      let data = res.data
      let config = {
        file: file,
        policy: data.policy,
        authorization: data.authorization,
        uploadUrl: data.upload_url
      }

      let {fileUploadPayload} = this.state
      Object.assign(fileUploadPayload, {
        id: data.id,
        name: file.name
      })

      API.file.uploadFile(config, e => {
        e.percent = (e.loaded / e.total) * 100
        onProgress(e)
      }).then(res => {
        let data = res.data

        Object.assign(fileUploadPayload, {
          created_at: data.time,
          mime_type: data.mimetype,
          size: data.file_size,
          cdn_path: data.url
        })

        this.props.setField(fileUploadPayload, this.props.item)
        onSuccess(res)
      }).catch(res => {
        onError(res)
      })
    })
  }

  render() {
    let {fileUploadPayload} = this.state
    return (
      <Upload {...this.uploadFileProps()}>
        <Button disabled={!util.isEmptyObj(fileUploadPayload) || this.props.disabled}>
          <Icon type='upload' /> 上传文件
        </Button>
      </Upload>
    )
  }
}
