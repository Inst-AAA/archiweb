import {io} from 'socket.io-client'
//
const socket = io("ws://8.136.121.130:27781/")

// const socket = process.env.NODE_ENV === 'development' ? io('ws://127.0.0.1:27781') : io('wss://web.archialgo.com');
// const socket = ""
export default socket