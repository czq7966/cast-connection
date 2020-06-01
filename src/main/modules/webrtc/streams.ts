import * as Cmds from "../../cmds";
import * as Services from '../../services'

import { IPeer } from "./peer";

export interface IStreamResolution {
    width: number,
    height: number
}

export interface IStreams extends Cmds.Common.ICommandRooter {
    peer: IPeer
    sends: Cmds.Common.Helper.KeyValue<MediaStream>
    recvs: Cmds.Common.Helper.KeyValue<MediaStream>
    resolutions: Cmds.Common.Helper.KeyValue<IStreamResolution>
}

export class Streams extends Cmds.Common.CommandRooter {
    peer: IPeer
    sends: Cmds.Common.Helper.KeyValue<MediaStream>
    recvs: Cmds.Common.Helper.KeyValue<MediaStream>
    resolutions: Cmds.Common.Helper.KeyValue<IStreamResolution>
    constructor(peer: IPeer) {
        super(peer.instanceId);
        this.peer = peer;
        this.sends = new Cmds.Common.Helper.KeyValue<MediaStream>(true);
        this.recvs = new Cmds.Common.Helper.KeyValue<MediaStream>();
        this.resolutions = new  Cmds.Common.Helper.KeyValue<IStreamResolution>();
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.sends.clear();
        this.recvs.clear();
        this.resolutions.clear();
        delete this.sends;
        delete this.recvs;     
        delete this.resolutions;
        super.destroy();
    }
    initEvents() {
        this.eventRooter.setParent(this.peer.eventRooter);        
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
        this.sends.on('add', this.onSendsAdd);
        this.sends.on('del', this.onSendsDel);
        this.sends.on('clear', this.onSendsClear);
    }
    unInitEvents() {
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();           
        this.sends.off('add', this.onSendsAdd);
        this.sends.off('del', this.onSendsDel);
        this.sends.off('clear', this.onSendsClear);
    }  

    // Command
    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_resolution:
                    Services.Cmds.StreamWebrtcResolution.Streams.onBeforeRoot.req(this, cmd as any)
                break;             
            case Cmds.ECommandId.stream_webrtc_video_constraints:
                    Services.Cmds.StreamWebrtcVideoConstraints.Streams.onBeforeRoot.req(this, cmd as any)
                break;                             
            default:
                break;
        }
    }
    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.network_disconnect: 
                Services.Cmds.Network.Disconnect.Streams.onAfterRoot.req(this, cmd as any);
                break;
            case Cmds.ECommandId.adhoc_logout:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Logout.Streams.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?            
                    Services.Cmds.Logout.Streams.onAfterRoot.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomClose.Streams.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomClose.Streams.onAfterRoot.resp(this, cmd as any) : null     
                break; 
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomLeave.Streams.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomLeave.Streams.onAfterRoot.resp(this, cmd as any) : null    
                break;  
            default:
                if (cmdId.indexOf(Cmds.Command_stream_webrtc_on_prefix) === 0) {
                    Services.Cmds.StreamWebrtcEvents.Streams.onAfterRoot.req(this, cmd)
                }               
                break;
        }        
    }

    onSendsAdd = (key: string, value: MediaStream) => {
        let owner = this.peer.user.room.owner().item;
        let getStats = () => {
            let stream = this.notDestroyed && this.sends.get(key);
            if (stream) {
                if (this.peer && this.peer.rtc) { 
                    let rtc = this.peer.rtc; 
                    let promises = [];

                    stream.getVideoTracks().forEach(track => {
                        let promise = rtc.getStats();
                        promise.then( report => {
                            let stats = {};
                            report.forEach((value, key, parent) => {
                                if (value && value.kind == 'video') {
                                    switch(value.type) {
                                        case 'remote-inbound-rtp':
                                        case 'track':
                                        case 'outbound-rtp':
                                            stats[value.id] = value;
                                            break;
                                    }
                                }
                            })  
                            let cmd: Cmds.ICommandData<any> = {
                                cmdId: Cmds.ECommandId.stream_webrtc_stats,
                                type: Cmds.ECommandType.resp,
                                props: {
                                    user: owner
                                },
                                extra: stats
                            }
                            this.peer.signaler.sendCommand(cmd)
                            .catch(e => {console.error(e)});              
                        });
                        promises.push(promise);
                    })
                    if (promises.length > 0) {
                        Promise.all(promises)
                        .then(v => {
                            timeoutGetStats();
                        })
                        .catch(e => {
                            timeoutGetStats();
                        })
                    }
                } else {
                    timeoutGetStats();                 
                }
            }
        } 
        let timeoutGetStats = (timeout?: number) => {
            setTimeout(() => {getStats(); }, timeout || 1000);                 
        }

        timeoutGetStats(); 

    }
    onSendsDel = (key: string, value: MediaStream) => {

    }
    onSendsClear = (keys: string[]) => {

    }
}