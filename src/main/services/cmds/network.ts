import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { User } from "./user";
import { Hello } from "./hello";
import { Logout } from "./logout";


var Tag = "Service-Cmds-Network"
export class Network {

    static Disconnect = {
        Rooms: {
            onAfterRoot: {
                req(rooms: Modules.IRooms, cmd: Cmds.CommandLogoutReq) {
                    adhoc_cast_connection_console.log(Tag, 'Rooms', 'onAfterRoot', 'Req', cmd.data)
                    rooms.clearRoom();
                    Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(rooms.instanceId).data = {}
                }
            }            
        },        
        Room: {
            onAfterRoot: {
                req(room: Modules.IRoom, cmd: Cmds.CommandLogoutReq) {
                    adhoc_cast_connection_console.log(Tag, 'Room', room.item.id, 'onAfterRoot', 'Req', cmd.data)
                    room.clearUser()                
                }
            }            
        }, 
        User: {
            onAfterRoot: {
                req(user: Modules.IUser, cmd: Cmds.CommandLogoutReq) {
                    adhoc_cast_connection_console.log(Tag, 'User', user.item.id, 'onAfterRoot', 'Req', cmd.data)
                }
            }            
        },   
        Peer: {
            onAfterRoot: {
                req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandLogoutReq) {
                    adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.id, 'onAfterRoot', 'Req', cmd.data)
                    peer.rtc && peer.getRtc().close();
                }
            }            
        },   
        Streams: {
            onAfterRoot: {
                req(streams: Modules.Webrtc.IStreams, cmd: Cmds.CommandLogoutReq) {
                    adhoc_cast_connection_console.log(Tag, 'Streams', streams.peer.user.item.id, 'onAfterRoot', 'Req', cmd.data)
                    streams.sends.clear();
                    streams.recvs.clear();
                }
            }            
        }                
    }

    static InputClient = {
        Connect: {
            onBeforeRoot: {
                req(rooms: Modules.IRooms, cmd: Cmds.CommandLogoutReq) {
                    adhoc_cast_connection_console.log(Tag, 'InputClient Rooms', 'onBeforeRoot', 'Req', cmd.data)
                    let room = rooms.getLoginRoom();
                    if (room) {
                        let user = room.owner()
                        if (user) {
                            user.states.set(Cmds.EUserState.input_client_connect)
                            User.syncHello(rooms.instanceId, user.item);
                        }
                    }
                }
            }               

        },
        Disconnect: {
            onBeforeRoot: {
                req(rooms: Modules.IRooms, cmd: Cmds.CommandLogoutReq) {
                    adhoc_cast_connection_console.log(Tag, 'InputClient Rooms', 'onBeforeRoot', 'Req', cmd.data)
                    let room = rooms.getLoginRoom();
                    if (room) {
                        let user = room.owner()
                        if (user) {
                            user.states.reset(Cmds.EUserState.input_client_connect)
                            User.syncHello(rooms.instanceId, user.item);
                        }
                    }
                }
            }  
        }
    }

    static Exception = {
        Connection: {
            onAfterRoot: {
                req(connection: Modules.IConnection , cmd: Cmds.CommandReq) {
                    adhoc_cast_connection_console.log(Tag, 'Connection', 'onAfterRoot', 'Req', cmd.data)
                    if (connection.isLogin()) {
                        let mRoom = connection.rooms.getLoginRoom();
                        let mMe = mRoom.me();
                        let me = mMe.item;
                        let mUsers = mRoom.users;
                        mUsers.keys().forEach(key => {
                            let mUser = mUsers.get(key);
                            let user = mUser.item;
                            if (user.id != me.id) {
                                Hello.hello(connection.instanceId, me, user)
                                .catch(e => {
                                    Logout.userLogout(connection.instanceId, user);
                                })                            
                            }
                        })    
                    }
                }                
            }, 
        }
    }


}