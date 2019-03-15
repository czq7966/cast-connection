import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { StreamWebrtcStreams } from './stream-webtrc-streams'

var Tag = "Service-Cmds-StreamWebrtcReady"
export class StreamWebrtcReady {
    static ready(instanceId: string, toUser: Cmds.IUser, fromUser?: Cmds.IUser, iceRestart?: boolean): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})
        fromUser = fromUser || ServiceModules.Rooms.getRoom(instanceId, toUser.room.id).me().item;
        let user = Object.assign({}, fromUser);
        cmd.data = {
            cmdId: Cmds.ECommandId.stream_webrtc_ready,
            to: {type: 'user', id: toUser.id},
            props: {
                user: user
            },
            extra: {
                iceRestart: iceRestart
            }
        }
        let promise = cmd.sendCommand();   
        cmd.destroy();
        cmd = null;   
        return promise;  
    }
    
    static Peer = {
        onBeforeRoot: {
            req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandReq) {
                console.log(Tag, 'Peer', peer.user.item.room.id , 'onBeforeRoot', 'Req', cmd.data);
                let data = cmd.data;
                if (data.props.user.id === peer.user.item.id && data.props.user.room.id === peer.user.item.room.id) {
                    let mMe = peer.user.room.me();
                    let sends = mMe.peer.streams.sends;
                    sends.keys().forEach(key => {
                        let stream = sends.get(key);
                        StreamWebrtcStreams.sendStream(peer.streams, stream);
                    })
                }                
            }                  
        },        
    }      

}