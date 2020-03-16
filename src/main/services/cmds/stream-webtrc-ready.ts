import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { StreamWebrtcStreams } from './stream-webtrc-streams'
import { Common } from "./common";

var Tag = "Service-Cmds-StreamWebrtcReady"
export class StreamWebrtcReady {
    static ready(instanceId: string, toUser: Cmds.IUser, fromUser?: Cmds.IUser, iceRestart?: boolean): Promise<any> {
        let mRoom = ServiceModules.Rooms.getRoom(instanceId, toUser.room.id);
        if (!mRoom || !mRoom.notDestroyed) {
            return Promise.reject("have been destroyed for some reason!");
        }

        fromUser = fromUser || mRoom.me().item;
        let user = Object.assign({}, fromUser);
        let reqData: Cmds.Common.ICommandData<Cmds.ICommandReqDataProps> = {
            cmdId: Cmds.ECommandId.stream_webrtc_ready,
            to: {type: 'user', id: toUser.id},
            props: {
                user: user
            },
            extra: {
                iceRestart: iceRestart
            },
            // respTimeout: 30 * 1000
        }
        return Common.sendCommandForResp(instanceId, reqData)
    }
    
    static Peer = {
        onBeforeRoot: {
            req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandReq) {
                adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onBeforeRoot', 'Req', cmd.data);
                let data = cmd.data;
                if (data.props.user.id === peer.user.item.id && data.props.user.room.id === peer.user.item.room.id) {
                    let mMe = peer.user.room.me();
                    let sends = mMe.peer.streams.sends;
                    let promises = [];
                    sends.keys().forEach(key => {
                        let stream = sends.get(key);
                        promises.push(StreamWebrtcStreams.sendStream(peer.streams, stream));
                    })
                    Promise.all(promises)
                    .then(() => {
                        Common.respCommand(peer.instanceId, data, true)
                    })
                    .catch(err => {
                        Common.respCommand(peer.instanceId, data, false, err)
                    })
                }                
            },
            resp(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandReq) {               
                adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onBeforeRoot', 'Resp', cmd.data);
            }
        },        
    }      

}