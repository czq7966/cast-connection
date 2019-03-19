import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'

var Tag = "Service-Cmds-StreamWebrtcCandidate"
export class StreamWebrtcCandidate {
    static candidate(instanceId: string, toUser: Cmds.IUser, toRoomUser: Cmds.IUser, candidate: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandStreamWebrtcCandidateReq({instanceId: instanceId})
            let user = Object.assign({}, toRoomUser);
            user.extra = candidate;
            cmd.data = {
                to: {type: 'user', id: toUser.id},
                props: {
                    user: user
                }
            }
            let promise = cmd.sendCommand();   
            cmd.destroy();
            cmd = null;   
            return promise;  
        })

    }
    
    static Peer = {
        onBeforeRoot: {
            req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandStreamWebrtcCandidateReq) {
                let data = cmd.data;
                let mUser = peer.user;
                let user = data.props.user;
                if (mUser.item.id === user.id && mUser.item.room.id === user.room.id) {
                    adhoc_cast_connection_console.log(Tag, 'Peer', mUser.item.room.id , 'onBeforeRoot', 'Req', cmd.data);                    
                    let candidate = user.extra;
                    if (candidate) {
                        ServiceModules.Webrtc.Peer.setCandidate(peer, candidate);
                    } else {
                        adhoc_cast_connection_console.log(Tag, 'Peer', mUser.item.room.id , 'onBeforeRoot', 'Req', 'ice candidate complete');                    
                    }                    
                }                  
            }                  
        },        
    }      

}