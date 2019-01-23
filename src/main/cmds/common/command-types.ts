import { ICommandClass, ICommand, Command } from "./command";
import * as Dts from './dts'

export interface ICommandType {
    cmdId?: string,
    name?: string,
    disabled?: boolean,
    describe?: string,
    ReqClass?:  ICommandClass , //编码类
    RespClass?: ICommandClass, //解码类
}


export class CommandTypes {
    static Types: {[name: string]: ICommandType} = {}
    static RegistCommandType(cmdType: ICommandType) {
        cmdType.ReqClass && ((cmdType.ReqClass as any as ICommandClass).defaultCommandId = cmdType.cmdId);
        cmdType.RespClass && ((cmdType.RespClass as any as ICommandClass).defaultCommandId = cmdType.cmdId);

        CommandTypes.Types[cmdType.cmdId] = cmdType;
    } 
    static decode(cmdData: Dts.ICommandData): ICommand {
        let _decode = (Class: ICommandClass) => {
            if (Class) {
                let cmd = new Class() as ICommand;    
                cmd.data.cmdId = cmdData.cmdId
                cmd.data.type = cmdData.type;
                cmd.data.sessionId = cmdData.sessionId;
                cmd.copyProperties(cmdData.props);
                cmd.assignData(cmdData)
                return cmd;
            } 
            return null;     
        }
    
        let CommandType = CommandTypes.Types[cmdData.cmdId];
        let Class = CommandType 
                        ? 
                        cmdData.type === Dts.ECommandType.req 
                            ? 
                            (CommandType.ReqClass || CommandType.RespClass) 
                            : 
                            (CommandType.RespClass || CommandType.ReqClass)
                        : null
                        
        let command = _decode(Class)
        if (command) {
            return command
        }else {        
            command = _decode(Command);
            console.error('CommandTypes 未注册 ' + cmdData.cmdId)
            console.log(CommandTypes)
            
        }
        return;
    
    }    
}
