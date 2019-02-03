import { Base, IBaseConstructorParams, IBase } from "./base";
import { ICommand } from "./command";
import { ECommandDispatchEvents, ECommandEvents, ICommandData } from "./dts";

enum EDispatcherCommandName {
    onCommand_Dispatched = 'onCommand_Dispatched',
    onCommand_BeforeDispatched = 'onCommand_BeforeDispatched',
    onCommand_Command = 'onCommand_Command',
    onCommand_BeforeCommand = 'onCommand_BeforeCommand'
}

export interface ICommandRooter extends IBase {

}

export class CommandRooter extends Base implements ICommandRooter {
    eventRooter: Cmds.Common.IEventRooter
}