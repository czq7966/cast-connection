import * as Cmds from "../../../cmds";
import { DataChannels } from "./datachannels";

export enum EDataChannelEvents {
    onbufferedamountlow = "bufferedamountlow",
    onclose = "close",
    onerror = "error",
    onmessage = "message",
    onopen = "open"
}
var DataChannelEventPrefix = 'datachannel';
export enum EDataChannelLabel {
    // default = 'datachannel_label_default',
    input = 'datachannel_label_input',
    signaler = 'datachannel_label_signaler'
}
// export enum EDataChannelEvents {
//     onbufferedamountlow = "datachannel_bufferedamountlow",
//     onclose = "datachannel_close",
//     onerror = "datachannel_error",
//     onmessage = "datachannel_message",
//     onopen = "datachannel_open"
// }

export interface IDataChannel extends Cmds.Common.ICommandRooter {
    rtcdatachannel: RTCDataChannel
    datachannels: DataChannels    
}

export class  DataChannel  extends Cmds.Common.CommandRooter implements IDataChannel {
    rtcdatachannel: RTCDataChannel
    datachannels: DataChannels
    private _channelevents;        
    constructor(datachannels: DataChannels, rtcdatachannel: RTCDataChannel) {
        super(datachannels.instanceId)
        this.datachannels = datachannels;
        this.rtcdatachannel = rtcdatachannel;
        this._channelevents = {}        
        this.initEvents();
    }
    destroy() {
        this.close();
        this.unInitEvents();     
        delete this._channelevents;        
        delete this.rtcdatachannel;  
        delete this.datachannels; 
        super.destroy();
    }
    initEvents() {
        this.initChannelEvents()              
    }
    unInitEvents() {
        this.unInitChannelEvents();
    }  
    initChannelEvents() {
        let datachannel = this.rtcdatachannel;
        datachannel.bufferedAmountLowThreshold = 1024 * 4;
        Object.keys(EDataChannelEvents).forEach(key => {            
            let value = EDataChannelEvents[key];
            let event = (...args: any[]) => {
                let user = Object.assign({}, this.datachannels.peer.user.item);
                user.extra = args;
                let cmdId = Cmds.Command_stream_webrtc_on_prefix + DataChannelEventPrefix + value; 
                let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = {
                    cmdId: cmdId,
                    props: {
                        user: user
                    },
                    extra: datachannel.label
                }
                this.datachannels.peer.user.room.rooms.dispatcher.onCommand(data)
            }
            this._channelevents[value] = event;

            value !== EDataChannelEvents.onmessage && datachannel.addEventListener(value, event)
        })
    }    
    unInitChannelEvents() {
        let datachannel = this.rtcdatachannel;
        Object.keys(this._channelevents).forEach(key => {
            let value = this._channelevents[key];
            datachannel.removeEventListener(key, value)
            delete this._channelevents[key]
        })
    }    
    close() {
        this.rtcdatachannel.close();
    }     
    sendMessage(msg: Object): Promise<any> {
        if (this.rtcdatachannel && this.rtcdatachannel.readyState === 'open') {
            let strMsg = JSON.stringify(msg);
            this.rtcdatachannel.send(strMsg);
            return Promise.resolve();
        } else {
            return Promise.reject('data channel is ' + this.rtcdatachannel.readyState)
        }
    }
}