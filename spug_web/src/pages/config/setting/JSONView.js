import React from 'react';
import { observer } from 'mobx-react';
import { Button, message} from 'antd';
import Editor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { http } from 'libs';
import store from './store';

@observer
class JSONView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      readOnly: true,
      body: ''
    }
  }

  componentDidMount() {
    this.updateValue()
  }

  updateValue = () => {
    const body = {};
    for (let item of store.records) {
      body[item.key] = item.value
    }
    this.setState({readOnly: true, body: JSON.stringify(body, null, 2)})
  };

  handleSubmit = () => {
    try {
      const data = JSON.parse(this.state.body);
      this.setState({loading: true});
      const formData = {type: store.type, o_id: store.id, env_id: store.env.id, data};
      http.post('/api/config/parse/json/', formData)
        .then(res => {
          message.success('保存成功');
          this.updateValue()
        })
        .finally(() => this.setState({loading: false}))
    } catch (err) {
      message.error('解析JSON失败，请检查输入内容')
    }
  };

  render() {
    const {body, readOnly, loading} = this.state;
    return (
      <div style={{position: 'relative'}}>
        <Editor
          mode="json"
          theme="tomorrow"
          height="500px"
          width="100%"
          readOnly={readOnly}
          setOptions={{useWorker: false}}
          style={{fontSize: 14}}
          value={body}
          onChange={v => this.setState({body: v})}/>
        {readOnly && <Button
          icon="edit"
          type="link"
          size="large"
          style={{position: 'absolute', top: 0, right: 0}}
          onClick={() => this.setState({readOnly: false})}>编辑</Button>}
        {readOnly || <Button
          icon="save"
          type="link"
          size="large"
          loading={loading}
          style={{position: 'absolute', top: 0, right: 0}}
          onClick={this.handleSubmit}>保存</Button>}
      </div>
    )
  }
}

export default JSONView