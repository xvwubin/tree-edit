import React from 'react';
import { Icon, Tree, Button, Modal, message } from 'antd';

import './index.scss';

const { TreeNode } = Tree;
const { confirm } = Modal;
class Course extends React.Component {
  expandedKeys = [];
  constructor(props) {
    super(props);
    this.data = [
      {
        value: '简介',
        defaultValue: '简介',
        key: '0-0',
        parentKey: '0',
        isEditable: false,
        title: '',
        children: [],
        isNew: false
      },
      {
        value: '常见问题',
        defaultValue: '常见问题',
        key: '0-1',
        parentKey: '0',
        isEditable: false,
        title: '',
        children: [],
        isNew: true
      },
      {
        value: '使用手册',
        defaultValue: '使用手册',
        key: '0-2',
        parentKey: '0',
        isEditable: false,
        title: '',
        children: [],
        isNew: false
      }
    ];
    this.state = {
      data: this.data,
      isPush: true,
      newData: []
    };
  }
  componentDidMount() {
    this.onExpand([]); // 手动触发，否则会遇到第一次添加子节点不展开的Bug
  }

  //找到新增节点的id
  newNodeArr = data => {
    let a = [];
    data.map(item => {
      if (item.children && item.children.length) {
        this.getTarget(item, a);
      } else {
        if (item.isNew) {
          a.push({ id: item.key });
        } else {
          return false;
        }
      }
    });
    return a;
  };

  getTarget(item, arr) {
    let that = this;
    // 如果内部还有children,那么反复递归当前函数, arr为存储所有符合条件值的数组
    if (item.children && item.children.length) {
      item.children.map(e => {
        that.getTarget(e, arr);
      });
    } else {
      if (item.isNew) {
        arr.push({ id: item.key });
      }
    }
  }

  //节点改为已新增
  newedNode = data => {
    let a = data;
    a.map(item => {
      item.isNew = false;
      if (item.children) {
        this.newedNode(item.children);
      }
    });
    return a;
  };

  onExpand = expandedKeys => {
    console.log('onExpand', expandedKeys);
    this.expandedKeys = expandedKeys;
    this.setState({ expandedKeys: expandedKeys });
  };

  //树渲染
  renderTreeNodes = data =>
    data.map(item => {
      if (item.isEditable) {
        item.title = (
          <div>
            <input
              className="inputField"
              value={item.value}
              onChange={e => this.onChange(e, item.key)}
            />
            <Icon
              type="close"
              style={{ marginLeft: 10 }}
              onClick={() => this.onClose(item.key, item.defaultValue)}
            />
            <Icon
              type="check"
              style={{ marginLeft: 10 }}
              onClick={() => this.onSave(item.key)}
            />
          </div>
        );
      } else {
        item.title = (
          <div className="titleContainer">
            <span>{item.value}</span>
            <span className={'operationField'}>
              <Icon
                style={{ marginLeft: 10 }}
                type="edit"
                onClick={() => this.onEdit(item.key)}
              />
              {item.children && item.children.length ? null : (
                <Icon
                  style={{ marginLeft: 10 }}
                  type="form"
                  onClick={() => this.openCourse(item.key, item.value)}
                />
              )}
              <Icon
                style={{ marginLeft: 10 }}
                type="plus"
                onClick={() => this.onAdd(item.key)}
              />
              {item.parentKey === '0' ? null : (
                <Icon
                  style={{ marginLeft: 10 }}
                  type="minus"
                  onClick={() => this.onDelete(item.key)}
                />
              )}
            </span>
          </div>
        );
      }

      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }

      return <TreeNode {...item} />;
    });

  //增加事件
  onAdd = e => {
    console.log('add');
    // 防止expandedKeys重复
    // Tip: Must have, expandedKeys should not be reduplicative
    if (this.state.expandedKeys.indexOf(e) === -1) {
      this.expandedKeys.push(e);
    }
    this.addNode(e, this.data);
    this.setState(
      {
        isPush: false,
        expandedKeys: this.expandedKeys,
        data: this.data
      },
      () => {
        console.log(this.state.data);
      }
    );
  };

  //增加节点
  addNode = (key, data) =>
    data.map(item => {
      if (item.key === key) {
        if (item.children) {
          let pkey = key + Math.floor(Math.random(1) * 1000);
          item.children.push({
            value: 'default',
            defaultValue: 'default',
            key: pkey, // 这个 key 应该是唯一的。 Tip: The key should be unique
            parentKey: key,
            isEditable: false,
            isNew: true
          });
        } else {
          let pkey = key + Math.floor(Math.random(1) * 1000);
          //接口
          item.children = [];
          item.children.push({
            value: 'default',
            defaultValue: 'default',
            key: pkey,
            parentKey: key,
            isEditable: false,
            isNew: true
          });
        }
        return;
      }
      if (item.children) {
        this.addNode(key, item.children);
      }
    });

  //删除事件
  onDelete = key => {
    console.log('delete');
    this.deleteNode(key, this.data);
    this.setState({
      isPush: false,
      data: this.data
    });
  };

  //删除节点
  deleteNode = (key, data) =>
    data.map((item, index) => {
      if (item.key === key) {
        data.splice(index, 1);
        return;
      } else {
        if (item.children) {
          this.deleteNode(key, item.children);
        }
      }
    });

  //编辑事件
  onEdit = key => {
    console.log('edit');
    this.editNode(key, this.data);
    this.setState({
      isPush: false,
      data: this.data
    });
  };

  //编辑节点
  editNode = (key, data) =>
    data.map(item => {
      if (item.key === key) {
        item.isEditable = true;
      } else {
        item.isEditable = false;
      }
      item.value = item.defaultValue; // 当某节点处于编辑状态，并改变数据，点击编辑其他节点时，此节点变成不可编辑状态，value 需要回退到 defaultvalue
      if (item.children) {
        this.editNode(key, item.children);
      }
    });

  //编辑框取消
  onClose = (key, defaultValue) => {
    console.log('close');
    this.closeNode(key, defaultValue, this.data);
    this.setState({
      data: this.data
    });
  };

  closeNode = (key, defaultValue, data) =>
    data.map(item => {
      item.isEditable = false;
      if (item.key === key) {
        item.value = defaultValue;
      }
      if (item.children) {
        this.closeNode(key, defaultValue, item.children);
      }
    });

  //编辑框保存
  onSave = key => {
    console.log('save');
    this.saveNode(key, this.data);
    this.setState({
      data: this.data
    });
  };

  saveNode = (key, data) => {
    data.map(item => {
      if (item.key === key) {
        item.defaultValue = item.value;
      }
      if (item.children) {
        this.saveNode(key, item.children);
      }
      item.isEditable = false;
    });
    console.log(1, this.data);
  };

  //输入框
  onChange = (e, key) => {
    console.log('onchange');
    this.changeNode(key, e.target.value, this.data);
    this.setState({
      data: this.data
    });
  };

  changeNode = (key, value, data) =>
    data.map(item => {
      if (item.key === key) {
        item.value = value;
      }
      if (item.children) {
        this.changeNode(key, value, item.children);
      }
    });

  render() {
    return (
      <div className="content-tree">
        <Tree showLine={true} onExpand={this.onExpand} defaultExpandAll>
          {this.renderTreeNodes(this.state.data)}
        </Tree>
      </div>
    );
  }
}

export default Course;
