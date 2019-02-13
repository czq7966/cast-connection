import * as Modules from '../../modules'



var Tag = "ServiceModuleConnection"
export class Connection{
    static getConnection(instanceId: string): Modules.Connection {
        return Modules.Connection.getInstance(instanceId, false)
    }
}