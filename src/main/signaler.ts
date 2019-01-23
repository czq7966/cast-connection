import { Client } from './client'; 
import * as Cmds from './cmds/index'
import { uuid } from './helper';

export interface ISignalerMessage {
    type: ESignalerMessageType
    data?: any
}

export enum ESignalerMessageType {
    offer = 'message-offer',
    answer = 'message-answer',
    candidate = 'message-candidate',
    icecomplete = 'message-icecomplete',
    hello = 'message-hello',
    ready = 'message-ready'
}


export class Signaler extends Client {
    
};