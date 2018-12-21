import { Base } from "./base"
import { Peer, ERTCPeerEvents } from "./peer";
import { DataChannel, EDataChannelLabel } from "./datachannel";


export class DataChannels extends Base {
    peer: Peer
    channels: {[label: string]: DataChannel}
    constructor(peer: Peer){
        super();
        this.peer = peer;
        this.channels = {};
        this.initEvents(peer);
    }
    destroy() {
        this.close();
        this.unInitEvents(this.peer);
        delete this.channels;
        delete this.peer;
        super.destroy();
    }
    attachPeer(peer: Peer) {
        this.unInitEvents(this.peer);
        delete this.peer;
        this.peer = peer;
        this.initEvents(peer)
    }

    initEvents(peer: Peer) {
        if (peer) {
            peer.eventEmitter.addListener(ERTCPeerEvents.ondatachannel, this.onDataChannel)
        }
    }
    unInitEvents(peer: Peer) {
        if (peer) {
            peer.eventEmitter.removeListener(ERTCPeerEvents.ondatachannel, this.onDataChannel)
        }
    }

    onDataChannel = (ev: RTCDataChannelEvent) => {
        let rtcchannel = ev.channel;
        if (rtcchannel) {
            let channel = this.getChannel(rtcchannel.label);
            if (channel.rtcchannel === rtcchannel) {
                console.log('data channel had exists ' + rtcchannel.label)

            } else {
                this.addDataChannel(new DataChannel(this, rtcchannel))
            }
        }
    }
    addDataChannel(channel: DataChannel) {
        if (channel) {
            let _channel = this.getChannel(channel.rtcchannel.label)
            if (!_channel || _channel !== channel) {
                this.closeChannel(channel.rtcchannel.label);
                channel.channels = this;
                this.channels[channel.rtcchannel.label] = channel;
            }
        }
    }
    createDataChannel(label?: string): DataChannel {
        if (this.peer) {
            label = label? label : EDataChannelLabel.default;
            let channel = this.getChannel(label);
            if (!channel) {
                let rtcchannel = this.peer.rtc().createDataChannel(label);
                channel = new DataChannel(this, rtcchannel);
                this.addDataChannel(channel);
            }
            return channel;
        }
    }
    getChannel(label: string): DataChannel {
        return this.channels[label];
    }
    getDefaultChannel(): DataChannel {
        return this.getChannel(EDataChannelLabel.default);
    }
    getGestureChannel(): DataChannel {
        return this.getChannel(EDataChannelLabel.gesture);
    }    
    closeChannel(label: string) {
        let channel = this.getChannel(label);
        if (channel) {
            channel.close();  
            delete this.channels[label]                      
            channel.destroy();           
        }            
    }
    closeChannels() {
        Object.keys(this.channels).forEach(label => {
            this.closeChannel(label);
        })
    }
    close() {
        this.closeChannels();
    }
}