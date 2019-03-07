import * as Cmds from "../../../cmds";
import { IDispatcher, Dispatcher } from "../dispatcher";


export class ExtensionCaptureFilter extends Cmds.Common.CommandRooter {
    dispatcher: IDispatcher;
    constructor(instanceId: string, dispatcher?: IDispatcher ) {
        super(instanceId);
        this.dispatcher = dispatcher || Dispatcher.getInstance(instanceId);
        this.initEvents();
    }   
    destroy() {
        this.unInitEvents();
        delete this.dispatcher;
        super.destroy();
    }

    initEvents() {
        this.eventRooter.setParent(this.dispatcher.sendFilter);        
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();        
    }    
    onAfterRoot = (data: Cmds.Common.ICommandData<any>): any => {
        let cmdId = data.cmdId;
        let type = data.type;

        switch(cmdId) {
            case Cmds.ECommandId.extension_capture_are_you_ready:
            case Cmds.ECommandId.extension_capture_get_custom_sourceId:
            case Cmds.ECommandId.extension_capture_i_am_ready:
            case Cmds.ECommandId.extension_capture_on_choose_desktop_media:
                console.log('aaaaaaaaaa', cmdId)

                return Cmds.Common.EEventEmitterEmit2Result.preventRoot;
                break;
            default:
                break;
        }        
    }     
}