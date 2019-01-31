import * as Cmds from "../cmds";
import * as Services from '../services'
import { IUser } from "./user";
import { Config } from "./config";
import { Streams } from "./streams";
import { DataChannels } from "./datachannels";
import { Input } from "./input";
import { EPlatform } from "../config";
import { WebRTC } from "./webrtc";
import { removeAllListeners } from "cluster";

enum ERTCPeerEvents {
    onconnectionstatechange = 'connectionstatechange',
    ondatachannel = 'datachannel',
    onicecandidate = 'icecandidate',
    onicecandidateerror = 'icecandidateerror',
    oniceconnectionstatechange = 'iceconnectionstatechange',
    onicegatheringstatechange = 'icegatheringstatechange',
    onnegotiationneeded = 'negotiationneeded',
    onsignalingstatechange = 'signalingstatechange',
    onstatsended = 'statsended',
    ontrack = 'track',
    onstream = 'stream',
    onaddstream = 'addstream',
    onrecvstream = '_recvstream',
    onrecvstreaminactive = '_recvstreaminactive',
    onsendstreaminactive = '_sendstreaminactive',
    ongetconfig = '_getconfig'   
}



export interface IPeer extends Cmds.Common.IBase {
    config: Config;
    user: IUser
    streams: Streams;
    datachannels: DataChannels;
    input: Input;  
    getRtc(): RTCPeerConnection
    delRtc()
}


var Tag = "ModulePeer"
export class Peer extends Cmds.Common.Base implements IPeer  {
    config: Config;
    user: IUser
    streams: Streams;
    datachannels: DataChannels;
    input: Input;
    rtc: RTCPeerConnection
    private _rtcevents;
    constructor(user: IUser) {
        super(user.instanceId);
        this._rtcevents = {}
        this.user = user;        
        this.config = new Config();
        this.streams = new Streams(this);
        this.datachannels = new DataChannels(this);
        this.input = new Input(this.datachannels);

        this.initEvents();
    }
    destroy() {
        this.unInitEvents();

        this.datachannels.close();
        this.input.destroy();
        this.datachannels.destroy();
        this.streams.destroy();     
   
        this.delRtc();
        delete this._rtcevents;
        delete this.user;
        delete this.config;
        delete this.streams;
        delete this.input;
        delete this.datachannels;  
        delete this.user;        
        super.destroy();
    }
    initEvents() {
        this.user.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command);
        this.user.eventEmitter.addListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command);
     
    }
    unInitEvents() {
        this.user.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command)
        this.user.eventEmitter.removeListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command)
    }   
    
    initRTCEvents(rtc: RTCPeerConnection) {
        rtc &&
        [ERTCPeerEvents].forEach(events => {
            Object.keys(ERTCPeerEvents).forEach(key => {
                let value = events[key];
                let event = (...args: any[]) => {
                    // console.log('PeerEvent:', value, ...args)
                    // this.eventEmitter.emit(value, ...args)
                    let user = Object.assign({}, this.user.item);
                    user.extra = args;
                    let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = {
                        cmdId: Cmds.Command_stream_webrtc_on_prefix + value,
                        props: {
                            user: user
                        }
                    }
                    this.user.room.rooms.dispatcher.onCommand(data)
                }
                this._rtcevents[value] = event;
                rtc.addEventListener(value, event)
            })
        })      
    }
    unInitRTCEvents(rtc: RTCPeerConnection) {
        rtc &&
        Object.keys(this._rtcevents).forEach(key => {
            let value = this._rtcevents[key];
            rtc.removeEventListener(key, value)
        })
    } 


    // Command
    onDispatched_Command = (cmd: Cmds.Common.ICommand) => {
        cmd.preventDefault = false;
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_sdp:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.StreamWebrtcSdp.Peer.onDispatched.req(this, cmd as any ) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.StreamWebrtcSdp.Peer.onDispatched.resp(this, cmd as any) : null    
                break;  
            case Cmds.ECommandId.stream_webrtc_candidate:
                Services.Cmds.StreamWebrtcCandidate.Peer.onDispatched.req(this, cmd as any );
                break;                 
            default:
                break;
        }
        !!cmd.preventDefault !== true && this.eventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmd);
    }
    onBeforeDispatched_Command = (cmd: Cmds.Common.ICommand) => {
        this.eventEmitter.emit(Cmds.ECommandEvents.onBeforeDispatched, cmd);
        if (!!cmd.preventDefault === true) return;

        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.network_disconnect:
                break;
            default:
                break;
        }        

        if (cmdId.indexOf(Cmds.Command_stream_webrtc_on_prefix) === 0) {
            Services.Cmds.StreamWebrtcEvents.Peer.onBeforeDispatched.req(this, cmd as any)
        }
    }    
    
    getConfig(): Config {
        return this.config;
    }    
    getRtc(): RTCPeerConnection {
        if (!this.rtc) {
            switch(Config.platform) {
                case EPlatform.reactnative:
                    this.rtc = new WebRTC.RTCPeerConnection(this.getConfig().rtcConfig)
                    break;
                default :
                    this.rtc = new RTCPeerConnection(this.getConfig().rtcConfig);
                    break;
            }
            this.initRTCEvents(this.rtc);
        }
        return this.rtc
    }    
    delRtc() {
        this.unInitRTCEvents(this.rtc);
        this.rtc && this.rtc.close();        
        delete this.rtc;
    }
}