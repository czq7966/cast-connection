import * as Cmds from "../../cmds";
import * as Modules from '../../modules'


var Tag = "Service-Cmds-Network"
export class Network extends Cmds.Common.Base {

    static Disconnect = {
        Rooms: {
            onAfterRoot: {
                req(rooms: Modules.IRooms, cmd: Cmds.CommandLogoutReq) {
                    console.log(Tag, 'Rooms', 'onAfterRoot', 'Req', cmd.data)
                    rooms.clearRoom();
                    Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(rooms.instanceId).data = {}
                }
            }            
        },        
        Room: {
            onAfterRoot: {
                req(room: Modules.IRoom, cmd: Cmds.CommandLogoutReq) {
                    console.log(Tag, 'Room', room.item.id, 'onAfterRoot', 'Req', cmd.data)
                    room.clearUser()                
                }
            }            
        }, 
        User: {
            onAfterRoot: {
                req(user: Modules.IUser, cmd: Cmds.CommandLogoutReq) {
                    console.log(Tag, 'User', user.item.id, 'onAfterRoot', 'Req', cmd.data)
                }
            }            
        },   
        Peer: {
            onAfterRoot: {
                req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandLogoutReq) {
                    console.log(Tag, 'Peer', peer.user.item.id, 'onAfterRoot', 'Req', cmd.data)
                    peer.rtc && peer.getRtc().close();
                }
            }            
        },   
        Streams: {
            onAfterRoot: {
                req(streams: Modules.Webrtc.IStreams, cmd: Cmds.CommandLogoutReq) {
                    console.log(Tag, 'Streams', streams.peer.user.item.id, 'onAfterRoot', 'Req', cmd.data)
                    streams.sends.clear();
                    streams.recvs.clear();
                }
            }            
        }                
    }


  


}