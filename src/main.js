import {convertErrorToObject, convertObjectToError, TimeoutError, SocketIOError} from './error'
import combineMiddlewares from 'combine-middlewares'

export default class SocketIORequest {
  constructor (io, options = {}) {
    this.io = io
    this.options = Object.assign({
      event: 'socket.io-request',
      timeout: 90000
    }, options)  //event timeoutを上書き
  }

  request (method, data) {
    /*返り値はpromise*/
    if (typeof method !== 'string') throw new Error('argument "method" is missing')

    return new Promise((resolve, reject) => {
      this.io.emit(this.options.event, {method, data}/*分割代入*/, (res) => {
        /*lisneterがわackでの返答をresで受けて走る*/
        clearTimeout(timeout)//タイムアウト解除
        this.io.removeListener('disconnect', onDisconnect)
        /*disconnect event list から toDisconnectを外す*/
        if (res.error) return reject(convertObjectToError(res.error))
        resolve(res.data)//promise->resolve
      })

      const onDisconnect = () => {
        //disconnect処理、タイムアウト消して、promiseをreject
        clearTimeout(timeout)
        reject(new SocketIOError('disconnect'))//disconnectのerrorをだす
      }

      const timeout = setTimeout(() => {
        /*this.potions.timeout後にdisconectイベントを消去し、タイムアウトエラーを投げる*/
        this.io.removeListener('disconnect', onDisconnect)
        reject(new TimeoutError(`exceeded ${this.options.timeout} (msec)`))
      }, this.options.timeout)

      this.io.once('disconnect', onDisconnect)  //一度呼び出されると、外れるリスナーを定義
    })
  }

  response (method, ...middlewares) {//ここでいうmethodは本来のeventのことか
    if (typeof method !== 'string') throw new Error('argument "method" is missing')
    if (middlewares.find(m => typeof m !== 'function')) {
      throw new Error('"middlewares" must be a function')
    }// middlewares全てが tyoe functionである
    const combined = combineMiddlewares(...middlewares.concat())// middlewares をchainに

    this.io.on(this.options.event, (req, ack) => {
      /*ackは呼べばemitに返答できる*/
      if (req.method !== method) return//二重登録を防ぐ
      const res = data => {console.log('data is ' + data); return ack({data})}
      res.error = err => ack({error: convertErrorToObject(err)})
      console.log(res)
      combined(req.data, res)  //処理本体
    })

  }
}
