import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { User } from "./user";

var Tag = "Service-Cmds-RoomClose"
export class RoomClose extends Cmds.Common.Base {
    static close(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandRoomCloseReq({instanceId: instanceId});   
            let currUser = User.CurrentUser(instanceId);   
            let user = Object.assign({}, currUser);
            user.room = room;           
            cmd.data = {
                props: {
                    user: user
                },
                onResp: (cmdResp: Cmds.CommandRoomCloseResp) => {
                    Cmds.Common.EDCoder.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
                    if (cmdResp.data.respResult) {
                        resolve(cmdResp.data);    
                    } else {
                        reject(cmdResp.data)
                    } 
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandRoomCloseRespDataProps>) => {
                    data.respResult = false;
                    data.respMsg = 'time out!';                    
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
            req(rooms: Modules.IRooms, cmd: Cmds.CommandRoomCloseReq) {
                console.log(Tag, 'Rooms',  'onAfterRoot', 'Req', cmd.data)
                let data = cmd.data;
                rooms.delRoom(data.props.user.room.id);
            },            
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomCloseResp) {
                console.log(Tag, 'Rooms', 'onAfterRoot', 'Resp', cmd.data)                    
                let data = cmd.data;
                if (data.respResult) {                    
                    rooms.delRoom(data.props.user.room.id);
                } 
            }          
        }        
    }

    static Room = {
        onAfterRoot: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomCloseReq) {
                console.log(Tag, 'Room', room.item.id , 'onAfterRoot', 'Req', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {                    
                    room.clearUser();
                }
            },            
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomCloseResp) {
                console.log(Tag, 'Room', room.item.id , 'onAfterRoot', 'Resp', cmd.data)
                let data = cmd.data;
                if (data.respResult && room.item.id === data.props.user.room.id) {                    
                    room.clearUser();
                } 
            }            
        }  
    }   
    
    static User = {
        onAfterRoot: {
            req(user: Modules.IUser, cmd: Cmds.CommandRoomCloseReq) {
                console.log(Tag, 'User', user.item.id , 'onAfterRoot', 'Req', cmd.data)
            },            
            resp(user: Modules.IUser, cmd: Cmds.CommandRoomCloseResp) {
                console.log(Tag, 'User', user.item.id , 'onAfterRoot', 'Resp', cmd.data)
            }            
        }  
    }      

    static Peer = {
        onAfterRoot: {
            req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandRoomCloseReq) {
                console.log(Tag, 'Peer', peer.user.item.id , 'onAfterRoot', 'Req', cmd.data)
                peer.rtc && peer.getRtc().close();
            },            
            resp(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandRoomCloseResp) {
                console.log(Tag, 'Peer', peer.user.item.id , 'onAfterRoot', 'Resp', cmd.data)
                peer.rtc && peer.getRtc().close();
            }            
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