import * as Dts from './dts';
import * as Common from './common/index'


export class CommandCommon extends Common.Command<Dts.ICommandData<any>, Common.ICommandConstructorParams<any>>  {
}


Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.network_disconnect,
    name: '网络断开',
    ReqClass: CommandCommon,
    RespClass: CommandCommon
})
