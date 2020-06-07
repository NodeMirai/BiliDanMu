import { IDanMu } from "../component/danmu";
import pako from 'pako';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

const readInt = function(buffer: any,start: any,len: any){
  let result = 0
  for(let i=len - 1;i >= 0;i--){
    result += Math.pow(256,len - i - 1) * buffer[start + i]
  }
  return result
}

/**
 * 组装ws请求包
 * @param blob 
 */
const encode = function(str: any,op: any){
  let data = textEncoder.encode(str);
  let packetLen = 16 + data.byteLength;
  let header = [0,0,0,0,0,16,0,1,0,0,0,op,0,0,0,1]
  writeInt(header,0,4,packetLen)
  return (new Uint8Array(header.concat(...data))).buffer
}

const writeInt = function(buffer: any,start: any,len: any,value: any){
  let i=0
  while(i<len){
    buffer[start + i] = value/Math.pow(256,len - i - 1)
    i++
  }
}

/**
 * 解析ws响应包
 * @param blob 
 */
const decode = async function(blob: any){
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    reader.onload = function (e: any){
      let buffer = new Uint8Array(e.target.result)
      let result: any = {}
      result.packetLen = readInt(buffer,0,4)
      result.headerLen = readInt(buffer,4,2)
      result.ver = readInt(buffer,6,2)
      result.op = readInt(buffer,8,4)
      result.seq = readInt(buffer,12,4)
      if(result.op === 5){
        result.body = []
        let offset = 0;
        while(offset < buffer.length){
          let packetLen = readInt(buffer,offset + 0,4)
          let headerLen = 16// readInt(buffer,offset + 4,4)
          let data = buffer.slice(offset + headerLen, offset + packetLen);

          /**
           * 仅有两处更改
           * 1. 引入pako做message解压处理，具体代码链接如下
           *    https://github.com/nodeca/pako/blob/master/dist/pako.js
           * 2. message文本中截断掉不需要的部分，避免JSON.parse时出现问题
           */
          let body = textDecoder.decode(pako.inflate(data));
          if (body) {
              result.body.push(JSON.parse(body.slice(body.indexOf("{"))));
          }

          offset += packetLen;
        }
      }else if(result.op === 3){
        result.body = {
          count: readInt(buffer,16,4)
        };
      }
      resolve(result)
    }
    reader.readAsArrayBuffer(blob);
  });
}

interface IDanMuParam {
  roomid?: string;
  onSuccess: (danmu: IDanMu) => void;
}

export default function createDanmuWsConnect({ roomid = '0', onSuccess }: IDanMuParam) {
  const ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
  ws.onopen = () => {
    ws.send(encode(JSON.stringify({
      roomid: +roomid
    }), 7));
    setInterval(function () {
      ws.send(encode('', 2));
    }, 30000);
  }

  ws.onmessage = async function (msgEvent) {
    const packet: any = await decode(msgEvent.data);
    switch (packet.op) {
      case 8:
        alert('加入房间');
        break;
      case 3:
        const count = packet.body.count
        console.log(`人气：${count}`);
        break;
      case 5:
        packet.body.forEach((body: any)=>{
          switch (body.cmd) {
            case 'DANMU_MSG':
              onSuccess({
                name: body.info[2][1],
                msg: body.info[1]
              });
              console.log(`${body.info[2][1]}: ${body.info[1]}`);
              break;
            case 'SEND_GIFT':
              console.log(`${body.data.uname} ${body.data.action} ${body.data.num} 个 ${body.data.giftName}`);
              break;
            case 'WELCOME':
              console.log(`欢迎 ${body.data.uname}`);
              break;
            // 此处省略很多其他通知类型
            default:
              console.log(body);
          }
        })
        break;
      default:
        console.log(packet);
    }
  };

  return ws;
}

