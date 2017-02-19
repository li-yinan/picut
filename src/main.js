import React from 'react';  //引入react组件
import ReactDOM from 'react-dom';  //引入react组件
class App extends React.Component {  //定义组件，也可以用React.createClass方法创建组件
    render() {
        return (
                <div>
                Hello World
                </div>
               );
    }
}
ReactDOM.render(<App />, document.getElementById('reactRoot'))  //使用组件并渲染到界面
