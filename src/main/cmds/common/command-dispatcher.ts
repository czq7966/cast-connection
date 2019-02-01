import { Base, IBaseConstructorParams, IBase } from "./base";
import { ICommand } from "./command";
import { ECommandDispatchEvents, ECommandEvents, ICommandData } from "./dts";

enum EDispatcherCommandName {
    onCommand_Dispatched = 'onCommand_Dispatched',
    onCommand_BeforeDispatched = 'onCommand_BeforeDispatched',
    onCommand_Command = 'onCommand_Command',
    onCommand_BeforeCommand = 'onCommand_BeforeCommand'
}

export interface ICommandDispatcher extends IBase {

}

export class CommandDispatcher extends Base implements ICommandDispatcher {
    Command_onDispatched = (cmd: ICommand) => {
        cmd.preventDefault = false;
        if (this.hasOwnProperty(EDispatcherCommandName.onCommand_Dispatched)) {
            this[EDispatcherCommandName.onCommand_Dispatched](cmd) as any;
        }
        (cmd.preventDefault as any !== true) && this.eventEmitter.emit(ECommandDispatchEvents.onDispatched, cmd);
    }   
    Command_onBeforeDispatched = (cmd: ICommand) => {
        cmd.preventDefault = false;
        this.eventEmitter.emit(ECommandDispatchEvents.onBeforeDispatched, cmd);
        if (cmd.preventDefault as any !== true) {
            if (this.hasOwnProperty(EDispatcherCommandName.onCommand_BeforeDispatched)) {
                this[EDispatcherCommandName.onCommand_BeforeDispatched](cmd) as any;
            }    
        }
    }       
    Command_onCommand = (data: ICommandData<any>) => {
        data.preventDefault = false;
        if (this.hasOwnProperty(EDispatcherCommandName.onCommand_Command)) {
            this[EDispatcherCommandName.onCommand_Command](data) as any;
        }
        (data.preventDefault as any !== true) && this.eventEmitter.emit(ECommandEvents.onCommand, data);
    }
    Command_onBeforeCommand = (data: ICommandData<any>) => {
        data.preventDefault = false;
        this.eventEmitter.emit(ECommandEvents.onBeforeCommand, data);
        if (data.preventDefault as any !== true) {
            if (this.hasOwnProperty(EDispatcherCommandName.onCommand_BeforeCommand)) {
                this[EDispatcherCommandName.onCommand_BeforeCommand](data) as any;
            }    
        }
    }   
}