import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import DanMu, { IDanMu } from './component/danmu';
import createDanmuWsConnect from './utils/createDanmuWsConnect';

let ws: WebSocket;

function App() {

    /** 房间号 3672155 */
    const [roomId, setRoomId] = useState<string>('3672155');

    const [danmuList, setDanmuList] = useState<IDanMu[]>([]);

    const onRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomId(e.target.value);
    }

    const onRoomConnect = () => {
        if (!roomId || !/\d/.test(roomId)) {
            alert('请输入有效房间号');
            return;
        }
        if (ws) ws.close();
        // 创建ws连接
        ws = createDanmuWsConnect({
            roomid: roomId,
            onSuccess(danmu: IDanMu) {
                danmuList.push(danmu);
                setDanmuList([...danmuList]);
            }
        })
    }

    const onConnectClose = () => {
        ws && ws.close();
        alert('关闭连接成功');
    }

    useEffect(() => {
        onConnectClose();
    }, []);
    
    return <main>
        <div>
            <label htmlFor="">房间号：</label>
            <input value={roomId} onChange={onRoomIdChange} type="text"/>
        </div>
        <div>
            <button onClick={onRoomConnect}>连接</button>
            <button onClick={onConnectClose}>关闭</button>
        </div>
        <div>
            {
                danmuList.map((item: IDanMu, index: number) => {
                    return <DanMu key={index} name={item.name} msg={item.msg} />
                })
            }
        </div>
        
    </main>
}

ReactDOM.render(<App />, document.getElementById('app'));
