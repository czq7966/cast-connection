import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { Debug } from "../../cmds/common/helper";



var Tag = "ServiceModuleConnection"
export class Connection{
    static getConnection(instanceId: string): Modules.Connection {
        return Modules.Connection.getInstance(instanceId, false)
    }
}