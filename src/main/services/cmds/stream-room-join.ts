import * as Cmds from "../../cmds";
import * as ServiceModules from '../modules/index'
import { RoomJoin } from "./room-join";
import { StreamRoomHello } from "./stream-room-hello";
import { StreamWebrtcReady } from "./stream-webtrc-ready";


var Tag = "Service-Cmds-StreamRoomJoin"
export class StreamRoomJoin extends Cmds.Common.Base {
    static join(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return RoomJoin.join(instanceId, room);

    }
    static joinAndHello(instanceId: string, toUser: Cmds.IUser): Promise<Cmds.ICommandData<Cmds.ICommandRespDataProps>> {
        return new Promise((resolve, reject) => {
            this.join(instanceId, toUser.room)
            .then(() => {
                let mMe =  ServiceModules.Rooms.getRoom(instanceId, toUser.room.id).me();
                StreamRoomHello.hello(instanceId, mMe.item, toUser)
                .then(data =>{
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
            })
            .catch(err => {
                reject(err)
            })    

        })
    }   
    static joinAndHelloAndReady(instanceId: string, toUser: Cmds.IUser): Promise<Cmds.ICommandData<Cmds.ICommandRespDataProps>> {
        return new Promise((resolve, reject) => {
            this.joinAndHello(instanceId, toUser)
            .then(data => {                        
                StreamWebrtcReady.ready(instanceId, toUser)
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
            })
            .catch(err => {
                reject(err)    
            })  
        })
    }      
}