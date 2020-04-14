import * as Cmds from '../../cmds/index'
import * as Modules from '../../modules'

var Tag = 'ServiceCommon'
export class Common {
    static sendCommand(instanceId: string, reqData: Cmds.Common.ICommandData<any>): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})
        cmd.data = reqData
        let promise = cmd.sendCommand();   
        cmd.destroy();
        cmd = null;   
        return promise;  
    }    
    static sendCommandForResp(instanceId: string, reqData: Cmds.Common.ICommandData<any>): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})
        cmd.data = reqData
        let promise = cmd.sendCommandForResp();   
        cmd.destroy();
        cmd = null;   
        return promise;  
    }

    static respCommand (instanceId: string, reqData: Cmds.Common.ICommandData<any>, result: boolean, msg?: any, dataExtra?: any, propExtra?: any, userExtra?: any) {
        let respCmd = new Cmds.CommandResp({instanceId: instanceId})
        let respData: Cmds.Common.ICommandData<any> = Object.assign({}, reqData, {
            type: Cmds.Common.ECommandType.resp,
            from: null,
            to: reqData.from,
            extra: dataExtra
        }) as any;                    
        if (propExtra !== undefined) {
            respData.props = respData.props || {}
            respData.props.extra = propExtra;
        }
        if (userExtra !== undefined) {
            respData.props = respData.props || {}
            respData.props.user = respData.props.user || {}
            respData.props.user.extra = userExtra;
        }
        respData.respResult = result;
        respData.respMsg = msg
        respCmd.data = respData;
        let promise = respCmd.sendCommand();
        respCmd.destroy();
        respCmd = null;
        return promise;
    }
    static async dispatchCommand(instanceId: string, cmd: Cmds.ICommandData<any>) {
        Modules.Dispatchers.Dispatcher.getInstance<Modules.Dispatchers.Dispatcher>(instanceId, false).onCommand(cmd);
    }   
}