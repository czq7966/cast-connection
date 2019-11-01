import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { User } from "./user";
import { StreamWebrtcSdp } from './stream-webtrc-sdp'

var Tag = "Service-Cmds-StreamWebrtcGetConfig"
export class StreamWebrtcGetConfig {
    static Connection = {
        onAfterRoot: {
            req(connection: Modules.IConnection , cmd: Cmds.CommandReq) {
                adhoc_cast_connection_console.log(Tag, 'Connection', 'onAfterRoot', 'Req', cmd.data)
                let user = cmd.data.props.user;
                let mRoom = connection.rooms.getRoom(user.room.id);
                let mUser = mRoom && mRoom.getUser(user.id);
                if (mUser && mUser.notDestroyed && connection.params.rtcConfig) {
                    Object.assign(mUser.peer.config.rtcConfig, connection.params.rtcConfig);
                }

            }                
        }, 
    }

}