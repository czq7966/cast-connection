import * as Cmds from "../../cmds";
import * as Services from '../../services'
import { IUser } from "./../user";
import { Config } from "./../config";
import { Streams } from "./streams";
import { DataChannels } from "./datachannels";
import { Input } from "./input";
import { EPlatform } from "../config";
import { WebRTC } from "./webrtc";

export enum ERTCPeerEvents {
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
export class Peer extends Cmds.Common.CommandDispatcher implements IPeer  {
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
        this.user.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched);
        this.user.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched);
        this.user.room.rooms.dispatcher.eventEmitter.addListener(Cmds.ECommandEvents.onCommand, this.Command_onCommand)
        this.user.room.rooms.dispatcher.eventEmitter.addListener(Cmds.ECommandEvents.onBeforeCommand, this.Command_onBeforeCommand)

    }
    unInitEvents() {
        this.user.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched)
        this.user.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched)
        this.user.room.rooms.dispatcher.eventEmitter.removeListener(Cmds.ECommandEvents.onCommand, this.Command_onCommand)        
        this.user.room.rooms.dispatcher.eventEmitter.removeListener(Cmds.ECommandEvents.onBeforeCommand, this.Command_onBeforeCommand)
    }   
    
    onCommand_Command = (data: Cmds.ICommandData<Cmds.ICommandReqDataProps>) => {
        let cmdId = data.cmdId;
        let type = data.type;
        switch(cmdId) {              
            default:
                break;
        }
    }

    onCommand_BeforeCommand = (data: Cmds.ICommandData<Cmds.ICommandReqDataProps>) => {
        let cmdId = data.cmdId;
        if (cmdId.indexOf(Cmds.Command_stream_webrtc_on_prefix) === 0) {
            Services.Cmds.StreamWebrtcEvents.Peer.onBeforeCommand.req(this, data)
        }
    }

    // Command
    onCommand_Dispatched = (cmd: Cmds.Common.ICommand) => {
        console.log(Tag, 'onDispatched', 'Req', cmd.data);
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
            case Cmds.ECommandId.stream_webrtc_ready:
                Services.Cmds.StreamWebrtcReady.Peer.onDispatched.req(this, cmd as any );
                break;                                 
            default:
                break;
        }
    }
    onCommand_BeforeDispatched = (cmd: Cmds.Common.ICommand) => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.network_disconnect:
                break;
            default:
                break;
        }        

        if (cmdId.indexOf(Cmds.Command_stream_webrtc_on_prefix) === 0) {
            // Services.Cmds.StreamWebrtcEvents.Peer.onBeforeDispatched.req(this, cmd as any)
        }
    }    

    initRTCEvents(rtc: RTCPeerConnection) {
        rtc &&
        [ERTCPeerEvents].forEach(events => {
            Object.keys(ERTCPeerEvents).forEach(key => {
                let value = events[key];
                let event = (...args: any[]) => {
                    // console.log('PeerEvent:', value, ...args)
                    let user = Object.assign({}, this.user.item);
                    user.extra = args;
                    let cmdId = Cmds.Command_stream_webrtc_on_prefix + value; 
                    let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = {
                        cmdId: cmdId,
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