import React from 'react';
import ReactDOM from 'react-dom';
import DanMuArea from './component/danmuArea';
import VoteArea from './component/voteArea';
import '../style/index.less';
import './style.less';

function App() {

    return (
        <main className="app">
            <DanMuArea />
            <VoteArea />
        </main>
    )
}

ReactDOM.render(<App />, document.getElementById('app'));
