import React, {Component} from 'react';
import {Table, Popconfirm, Button} from 'antd';
import API from '../../io'
import utils from '../../utils'
import './index.css'

const ButtonGroup = Button.Group;

export default class SchemaTable extends React.Component {
  constructor(props) {
    super(props);
    this.tableID = window._USER_CONFIG.TABLE_ID[0]
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
        showTotal: total => `共 ${total} 条数据`,
      },
      selectedRowKeys: [],
    }

  }

  componentDidMount() {
    this.fetchData()
  }


  fetchTableData() {
    let {pagination} = this.state
    API.schema.getRecord(this.tableID, {
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
            // this.toggleAddRowModalView(record)
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
      ),
    }
  }

  deleteRow(ids) {
    API.schema.deleteRow(this.tableID, ids).then(res => {
      this.fetchTableData()
      this.setState({
        selectedRowKeys: []
      })
    })
  }

  render() {
    let {pagination, schemaInfo, tableData, selectedRowKeys} = this.state
    if (!schemaInfo) return null

    const rowSelection = {
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    };

    return <div className='schema-table-panel'>
      <div className="table-header">
        <ButtonGroup>
          <Button>添加行</Button>
          <Button>查询</Button>
          {selectedRowKeys.length > 0 ?
            <Popconfirm
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
    </div>
  }
}