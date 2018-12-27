import { Base } from "./base";
import { DataChannels } from "./datachannels";

enum _EDataChannelEvents {
    onbufferedamountlow = "bufferedamountlow",
    onclose = "close",
    onerror = "error",
    onmessage = "message",
    onopen = "open"
}
var DataChannelEventPrefix = 'datachannel_';
export enum EDataChannelLabel {
    // default = 'datachannel_label_default',
    input = 'datachannel_label_input'
}
export enum EDataChannelEvents {
    onbufferedamountlow = "datachannel_bufferedamountlow",
    onclose = "datachannel_close",
    onerror = "datachannel_error",
    onmessage = "datachannel_message",
    onopen = "datachannel_open"
}

export class  DataChannel extends Base {
    rtcchannel: RTCDataChannel
    channels: DataChannels
    private _channelevents;        
    constructor(channels: DataChannels, rtcchannel: RTCDataChannel) {
        super()
        this.channels = channels;
        this.rtcchannel = rtcchannel;
        this._channelevents = {}        
        this.initEvents();
        this.initChannelEvents(this.rtcchannel)        
    }
    destroy() {
        this.close();
        this.unInitChannelEvents(this.rtcchannel)
        this.unInitEvents();     
        delete this._channelevents;        
        delete this.rtcchannel;  
        delete this.channels; 
        super.destroy();
    }
    initEvents() {
        this.eventEmitter.addListener(EDataChannelEvents.onbufferedamountlow, this.onBufferedAmountLow)
        this.eventEmitter.addListener(EDataChannelEvents.onclose, this.onClose)
        this.eventEmitter.addListener(EDataChannelEvents.onerror, this.onError)
        this.eventEmitter.addListener(EDataChannelEvents.onmessage, this.onMessage)
        this.eventEmitter.addListener(EDataChannelEvents.onopen, this.onOpen)
    }
    unInitEvents() {
        this.eventEmitter.removeListener(EDataChannelEvents.onbufferedamountlow, this.onBufferedAmountLow)
        this.eventEmitter.removeListener(EDataChannelEvents.onclose, this.onClose)
        this.eventEmitter.removeListener(EDataChannelEvents.onerror, this.onError)
        this.eventEmitter.removeListener(EDataChannelEvents.onmessage, this.onMessage)
        this.eventEmitter.removeListener(EDataChannelEvents.onopen, this.onOpen)
    }
    initChannelEvents(channel: RTCDataChannel) {
        Object.keys(_EDataChannelEvents).forEach(key => {            
            let value = _EDataChannelEvents[key];
            let id = channel.id.toString() + value;
            let event = (...args: any[]) => {
                if (this.notDestroyed) {
                    this.eventEmitter.emit(DataChannelEventPrefix + value, ...args);
                    this.channels.eventEmitter.emit(DataChannelEventPrefix + value, this, ...args);
                }
            }
            this._channelevents[id] = event;
            channel.addEventListener(value, event)
        })
    }    
    unInitChannelEvents(channel: RTCDataChannel) {
        channel &&
        Object.keys(_EDataChannelEvents).forEach(key => {
            let value = _EDataChannelEvents[key];
            let id = channel.id.toString() + value;
            let event = this._channelevents[id];
            event && channel.removeEventListener(value, event);
            delete this._channelevents[id];
        })
    }    

    onBufferedAmountLow = (ev: Event) => {
        console.log('on data channel buffered amount low')
    }
    onClose = (ev: Event) => {
        console.log('on data channel close')
    }
    onError = (ev: RTCErrorEvent) => {
        console.log('on data channel error', ev)
    }
    onMessage = (ev: MessageEvent) => {        
        // console.log('on data channel message: ' , ev.data, ev)
    }
    onOpen = (ev: Event) => {
        console.log('on data channel open ', this)
    }           
    close() {
        this.rtcchannel.close();
    }     
    sendMessage(msg: Object): Promise<any> {
        if (this.rtcchannel && this.rtcchannel.readyState === 'open') {
            this.rtcchannel.send(JSON.stringify(msg));
        } else {
            return Promise.reject('data channel is ' + this.rtcchannel.readyState)
        }
    }
}