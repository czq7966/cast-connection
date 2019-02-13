import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules'
import { User } from "./user";
import { RoomLeave } from "./room-leave";

var Tag = "Service-Cmds-Logout"
export class Logout extends Cmds.Common.Base {
    static logout(instanceId: string): Promise<any> {
        return new Promise((resolve, reject) => { 
            let cmd = new Cmds.CommandLogoutReq({instanceId: instanceId});
            let currUser = User.CurrentUser(instanceId);   
            cmd.data = {
                props: {
                    user: currUser
                },
                onResp: (cmdResp: Cmds.CommandLoginResp) => {
                    // Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onBeforeDispatched);
                    Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
                    if (cmdResp.data.props.result) {
                        resolve(cmdResp.data);    
                    } else {
                        reject(cmdResp.data)
                    } 
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandLogoutRespDataProps>) => {
                    data.props.result = false;
                    data.props.msg = 'time out!';                    
                    reject(data);    
                }   
            }
            cmd.sendCommand();        
            cmd.destroy();
            cmd = null;
        })
    }

 

    static Rooms = {
        onAfterRoot: {
            req(rooms: Modules.IRooms, cmd: Cmds.CommandRoomLeaveReq) {
                console.log(Tag, 'Rooms', 'onAfterRoot', 'Req', cmd.data);
                RoomLeave.Rooms.onAfterRoot.req(rooms, cmd);

            },            
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomLeaveResp) {
                console.log(Tag, 'Rooms', 'onAfterRoot', 'Resp', cmd.data);
                RoomLeave.Rooms.onAfterRoot.resp(rooms, cmd);
                rooms.clearRoom();
            } 
        }
    }

    static Room = {
        onAfterRoot: {
            req(room: Modules.IRoom, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'Room', room.item.id, 'onAfterRoot', 'Req', cmd.data)
                let user = cmd.data.props.user;
                let me = room.me();
                if (me && user.id === me.item.id) {
                    room.clearUser()
                } else {
                    room.delUser(user.id)
                }
            },
            resp(room: Modules.IRoom, cmd: Cmds.CommandLogoutResp) {
                console.log(Tag, 'Room', room.item.id, 'onAfterRoot', 'Resp', cmd.data)
                let user = cmd.data.props.user;
                let me = room.me();
                if (me && user.id === me.item.id) {
                    room.clearUser()
                } else {
                    room.delUser(user.id)
                }
            },            
        }
    }    

    static User = {
        onAfterRoot: {
            req(user: Modules.IUser, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'User', user.item.id, 'onAfterRoot', 'Req', cmd.data)
            },  
            resp(user: Modules.IUser, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'User', user.item.id, 'onAfterRoot', 'Resp', cmd.data)
            },      
        }
    }

    static Peer = {
        onAfterRoot: {
            req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'Peer', peer.user.item.id, 'onAfterRoot', 'Req', cmd.data)
                peer.rtc && peer.getRtc().close();
            },  
            resp(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'Peer', peer.user.item.id, 'onAfterRoot', 'Resp', cmd.data)
                peer.rtc && peer.getRtc().close();
            },      
        }
    }

    static Streams = {
        onAfterRoot: {
            req(streams: Modules.Webrtc.IStreams, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'Streams', streams.peer.user.item.id, 'onAfterRoot', 'Req', cmd.data)
                streams.sends.clear();
                streams.recvs.clear();
            },  
            resp(streams: Modules.Webrtc.IStreams, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'Streams', streams.peer.user.item.id, 'onAfterRoot', 'Resp', cmd.data)
                streams.sends.clear();
                streams.recvs.clear();
            },      
        }
    }
}