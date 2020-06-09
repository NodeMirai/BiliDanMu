import React, { useState, useEffect } from 'react';
import DanMu, { IDanMu } from './component/danmu';
import createDanmuWsConnect from '../../utils/createDanmuWsConnect';
import './style.less';

let ws: WebSocket;

function DanMuArea() {

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

    /** 关闭ws链接 */
    const onConnectClose = () => {
        ws && ws.close();
    }

    useEffect(() => {
        onConnectClose();
    }, []);

    return (
        <div className="danmu-area full-height">
            <div>
                <label htmlFor="">房间号：</label>
                <input value={roomId} onChange={onRoomIdChange} type="text" />
            </div>
            <div>
                <button onClick={onRoomConnect}>连接</button>
                <button onClick={onConnectClose}>关闭</button>
            </div>
            <div className="danmu-area__list">
                {
                    danmuList.map((item: IDanMu, index: number) => {
                        return <DanMu key={index} name={item.name} msg={item.msg} />
                    })
                }
            </div>
        </div>
    )
}

export default DanMuArea;