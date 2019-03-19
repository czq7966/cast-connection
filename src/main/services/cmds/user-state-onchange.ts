import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules'

var Tag = "Service-Cmds-UserStateOnChange"
export class UserStateOnChange {
    static User = {
        onBeforeRoot: {
            req(mUser: Modules.IUser, cmd: Cmds.CommandReq) {
                let data = cmd.data;
                if (mUser.item.id === data.props.user.id && mUser.item.room.id === data.props.user.room.id) {
                    console.log(Tag, 'User', mUser.item.room.id , 'onBeforeRoot', 'Req', cmd.data);
                    let user = cmd.data.props.user;
                    let states = user.extra as Cmds.Common.Helper.IStateChangeValues;
                    
                    if (Cmds.Common.Helper.StateMachine.isset(states.chgStates, Cmds.EUserState.stream_room_sending)) {
                        if (!Cmds.Common.Helper.StateMachine.isset(states.newStates, Cmds.EUserState.stream_room_sending)) {
                            let mStreamRoom = mUser.getStreamRoom();
                            if (mStreamRoom) {
                                mStreamRoom.users.keys().forEach(key => {
                                    let rmUser = mStreamRoom.users.get(key);                                    
                                    if (rmUser.peer) {
                                        ServiceModules.Webrtc.Streams.closeRecvStream(rmUser.peer.streams)
                                    }
                                })
                            }

                        }
                    }
                     
                }                  
            },
        },        
    } 
}