import React from 'react'
import {Table, Popconfirm, Button, Spin, message} from 'antd'
import API from '../../io'
import utils from '../../utils'
import AddRowModalView from '../AddRowModalView'
import SchemaDataFilterFormModal from '../SchemaDataFilterFormModal'
import './index.css'
import CommonContainer from '../CommonContainer'

const ButtonGroup = Button.Group

export default class SchemaTable extends React.Component {
  constructor(props) {
    super(props)
    this.tableID = window.ACTIVE_TABLE_ID
    this.editModalUid = 1
    this.state = {
      schemaInfo: null,
      tableData: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 20,
        // 显示跳页器
        showQuickJumper: true,
        // 显示条数选择器
        showSizeChanger: true,
        // 条数选择器选项
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: total => `共 ${total} 条数据`
      },
      selectedRowKeys: [],
      showEditRowModal: false,
      currentEditingRow: null,
      query: {},
      showQueryModal: false
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  handleAddRow = () => {
    this.editModalUid++
    this.setState({
      showEditRowModal: true,
      currentEditingRow: null
    })
  }

  handleEditRow(row) {
    this.editModalUid++
    this.setState({
      showEditRowModal: true,
      currentEditingRow: row
    })
  }

  fetchTableData() {
    let {pagination, query} = this.state
    API.schema.getRecord(this.tableID, {
      where: query,
      offset: (pagination.current - 1) * pagination.pageSize,
      limit: pagination.pageSize
    }).then(res => {
      let p = {...pagination}
      p.total = res.data.meta.total_count
      this.setState({
        tableData: res.data.objects,
        pagination: p
      })
    })
  }

  fetchData() {
    API.schema.getSchema(this.tableID).then(res => {
      this.columns = utils.formatColumn(res.data.schema.fields).concat([this.actionRow()])
      this.setState({
        schemaInfo: res.data
      })
    })

    this.fetchTableData()
  }

  handleTableChange = pagination => {
    let p = {...this.state.pagination}
    p.current = pagination.current
    p.pageSize = pagination.pageSize

    this.setState({
      pagination: p
    }, () => {
      this.fetchTableData()
    })
  }

  actionRow = () => {
    return {
      title: <div>操作</div>,
      key: 'ifrx-operation',
      fixed: 'right',
      width: 200,
      render: (text, record) => (
        <div className='schema-table-td' style={{verticalAlign: 'bottom'}}>
          <a onClick={() => {
            this.handleEditRow(record)
          }}>编辑</a>
          {
            <Popconfirm
              title={'确定删除所选的数据行吗?'}
              onConfirm={() => {
                this.deleteRow(text._id)
              }}
              okText={'确定'} cancelText={'取消'}>
              <a style={{marginLeft: 40}}>{'删除'}</a>
            </Popconfirm>
          }
        </div>
      )
    }
  }

  deleteRow(ids) {
    if (Array.isArray(ids)) return message.error('暂不支持批量删除')
    API.schema.deleteRow(this.tableID, ids).then(res => {
      this.fetchTableData()
      this.setState({
        selectedRowKeys: []
      })
    })
  }

  handleApplyQuery = query => {
    let p = {...this.state.pagination}
    p.current = 1
    this.setState({
      pagination: p,
      query
    }, () => {
      this.fetchTableData()
    })
  }

  render() {
    let {
      pagination,
      schemaInfo,
      tableData,
      selectedRowKeys,
      currentEditingRow,
      showEditRowModal,
      showQueryModal
    } = this.state
    if (!schemaInfo) {
      return <div>
        <center><Spin size='large' /></center>
      </div>
    }

    const rowSelection = {
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

    return <CommonContainer className='schema-table-panel'>
      <div className='table-header'>
        <ButtonGroup>
          <Button onClick={this.handleAddRow}>添加行</Button>
          <Button onClick={() => {
            this.setState({
              showQueryModal: true
            })
          }}>查询</Button>
          {selectedRowKeys.length > 0
            ? <Popconfirm
              title={'确定删除所选的数据行吗?'}
              onConfirm={() => {
                this.deleteRow(selectedRowKeys)
              }}>
              <Button>删除行</Button>
            </Popconfirm>

            : null}
        </ButtonGroup>
      </div>
      <Table
        pagination={pagination}
        rowKey={record => record._id}
        rowSelection={rowSelection}
        scroll={{x: this.columns.length * 200 + 63}}
        columns={this.columns}
        onChange={this.handleTableChange}
        dataSource={tableData} />
      <SchemaDataFilterFormModal
        setQuery={this.handleApplyQuery}
        onClose={() => {
          this.setState({
            showQueryModal: false
          })
        }}
        show={showQueryModal} />
      <AddRowModalView
        tableID={this.tableID}
        show={showEditRowModal}
        key={this.editModalUid}
        fields={this.columns.filter(v => v.key !== 'ifrx-operation')}
        currentEditingRow={currentEditingRow}
        onClose={() => {
          this.fetchTableData()
          this.setState({
            showEditRowModal: false
          })
        }} />
    </CommonContainer>
  }
}
