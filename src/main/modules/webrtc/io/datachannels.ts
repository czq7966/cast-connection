import * as Cmds from "../../../cmds";
import * as Services from '../../../services'
import { Peer } from "../peer";
import { DataChannel, EDataChannelLabel } from "./datachannel";

export enum EDataChannelsEvents {
    onAddDataChannel = 'onAddDataChannel'
}

export interface IDataChannels extends Cmds.Common.ICommandRooter {
    peer: Peer
    dataChannels: {[label: string]: DataChannel}
    createDataChannels()
    closeDataChannels()
    createDataChannel(label: string): DataChannel
    closeDataChannel(label: string) 
    getDataChannel(label: string): DataChannel
    addDataChannel(datachannel: DataChannel)
    onDataChannel(ev: RTCDataChannelEvent)
    close() 
}

export class DataChannels extends Cmds.Common.CommandRooter implements IDataChannels {
    peer: Peer
    dataChannels: {[label: string]: DataChannel}
    constructor(peer: Peer){
        super(peer.instanceId);
        this.peer = peer;
        this.dataChannels = {};
        this.initEvents();
    }
    destroy() {
        this.close();
        this.unInitEvents();
        delete this.dataChannels;
        delete this.peer;
        super.destroy();
    }

    initEvents() {
        this.eventRooter.setParent(this.peer.eventRooter);        
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();           
    }  

    // Command
    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_ondatachannel: 
                Services.Cmds.StreamIODataChannels.DataChannels.onBeforeRoot.req(this, cmd as any)
                break;
            default:
                
                break;
        }
    }
    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_ondatachannelclose: 
                Services.Cmds.StreamIODataChannels.DataChannels.onAfterRoot.req(this, cmd as any)
                break;
            default:
                
                break;
        }     
    }  
    onDataChannel = (ev: RTCDataChannelEvent) => {
        let rtcchannel = ev.channel;
        if (rtcchannel) {
            let channel = this.getDataChannel(rtcchannel.label);
            if (channel && channel.rtcdatachannel === rtcchannel) {
                console.log('data channel had exists ' + rtcchannel.label)
            } else {
                this.addDataChannel(new DataChannel(this, rtcchannel))
            }
        }
    }
    addDataChannel(datachannel: DataChannel) {
        if (datachannel) {
            let _datachannel = this.getDataChannel(datachannel.rtcdatachannel.label)
            if (!_datachannel || _datachannel !== datachannel) {
                this.closeDataChannel(datachannel.rtcdatachannel.label);
                datachannel.datachannels = this;
                this.dataChannels[datachannel.rtcdatachannel.label] = datachannel;
                this.eventEmitter.emit(EDataChannelsEvents.onAddDataChannel, datachannel)
            }
        }
    }
    createDataChannel(label: string): DataChannel {
        if (this.peer && label) {
            let channel = this.getDataChannel(label);
            if (!channel) {
                let rtcchannel = this.peer.getRtc().createDataChannel(label);
                channel = new DataChannel(this, rtcchannel);
                this.addDataChannel(channel);
            }
            return channel;
        }
    }
    createDataChannels(){
        Object.keys(EDataChannelLabel).forEach(key => {
            let label = EDataChannelLabel[key]
            this.createDataChannel(label)
        })
    }    
    getDataChannel(label: string): DataChannel {
        return this.dataChannels[label];
    }

    getInputDataChannel(): DataChannel {
        return this.getDataChannel(EDataChannelLabel.input);
    }    
    closeDataChannel(label: string) {
        let channel = this.getDataChannel(label);
        if (channel) {
            channel.close();  
            delete this.dataChannels[label]                      
            channel.destroy();           
        }            
    }
    closeDataChannels() {
        Object.keys(this.dataChannels).forEach(label => {
            this.closeDataChannel(label);
        })
    }
    close() {
        this.closeDataChannels();
    }
}