export as namespace ADHOCCAST;
// Generated by dts-bundle v0.7.3
// Dependencies for this module:
//   events

import { EventEmitter } from "events";
import { EventEmitter } from 'events';

interface IBase {
    notDestroyed: boolean;
    eventEmitter: EventEmitter;
    destroy(): any;
}
class Base {
    notDestroyed: boolean;
    eventEmitter: EventEmitter;
    constructor();
    destroy(): void;
}

enum ECustomEvents {
    message = "room-message",
    openRoom = "room-open",
    joinRoom = "room-join",
    closeRoom = "room-close",
    leaveRoom = "room-leave"
}
interface IUserQuery {
    roomid?: string;
    password?: string;
    isOwner?: boolean;
    max?: number;
    from?: string;
    to?: string;
    msg?: any;
}
enum EClientBaseEvents {
    connect = "connect",
    connect_error = "connect_error",
    connect_timeout = "connect_timeout",
    connecting = "connecting",
    disconnect = "disconnect",
    error = "error",
    reconnect = "reconnect",
    reconnect_attempt = "reconnect_attempt",
    reconnect_failed = "reconnect_failed",
    reconnect_error = "reconnect_error",
    reconnecting = "reconnecting"
}
class Client {
    eventEmitter: EventEmitter;
    socket: SocketIOClient.Socket;
    url: string;
    constructor(url?: string);
    destroy(): void;
    id(): string;
    connected(): boolean;
    connect(url?: string): Promise<any>;
    disconnect(): void;
    initEvents(socket: SocketIOClient.Socket): void;
    unInitEvents(socket: SocketIOClient.Socket): void;
    openRoom(query: IUserQuery, url?: string): Promise<any>;
    joinRoom(query: IUserQuery): Promise<string>;
    leaveRoom(query: IUserQuery): Promise<any>;
    sendMessage(query: IUserQuery): Promise<any>;
}

enum ECodecs {
    default = "default",
    vp8 = "vp8",
    vp9 = "vp9",
    h264 = "h264"
}
enum EPlatform {
    reactnative = "reactnative",
    browser = "browser"
}
class Config {
    static platform: EPlatform;
    bandwidth: number;
    codec: string;
    iceServers: RTCIceServer[];
    rtcConfig: RTCConfiguration;
    constructor();
}

class Connection extends Base {
    signaler: Signaler;
    rooms: Rooms;
    dispatcher: Dispatcher;
    stream: MediaStream;
    constructor(url: string);
    destroy(): void;
    initEvents(): void;
    unInitEvents(): void;
    id(): string;
    openRoom(query: IUserQuery, url?: string): Promise<any>;
    joinRoom(query: IUserQuery): Promise<any>;
    leaveRoom(query: IUserQuery): Promise<any>;
    onDisconnect: (reason: any) => void;
    onCloseRoom: () => void;
    close(): void;
}

enum EDataChannelLabel {
    input = "datachannel_label_input"
}
enum EDataChannelEvents {
    onbufferedamountlow = "datachannel_bufferedamountlow",
    onclose = "datachannel_close",
    onerror = "datachannel_error",
    onmessage = "datachannel_message",
    onopen = "datachannel_open"
}
class DataChannel extends Base {
    rtcchannel: RTCDataChannel;
    channels: DataChannels;
    constructor(channels: DataChannels, rtcchannel: RTCDataChannel);
    destroy(): void;
    initEvents(): void;
    unInitEvents(): void;
    initChannelEvents(channel: RTCDataChannel): void;
    unInitChannelEvents(channel: RTCDataChannel): void;
    onBufferedAmountLow: (ev: Event) => void;
    onClose: (ev: Event) => void;
    onError: (ev: RTCErrorEvent) => void;
    onMessage: (ev: MessageEvent) => void;
    onOpen: (ev: Event) => void;
    close(): void;
    sendMessage(msg: Object): Promise<any>;
}

enum EDataChannelsEvents {
    onAddDataChannel = "onAddDataChannel"
}
class DataChannels extends Base {
    peer: Peer;
    channels: {
        [label: string]: DataChannel;
    };
    constructor(peer: Peer);
    destroy(): void;
    attachPeer(peer: Peer): void;
    initEvents(peer: Peer): void;
    unInitEvents(peer: Peer): void;
    onDataChannel: (ev: RTCDataChannelEvent) => void;
    addDataChannel(channel: DataChannel): void;
    createDataChannel(label: string): DataChannel;
    createDataChannels(): void;
    getChannel(label: string): DataChannel;
    getInputChannel(): DataChannel;
    closeChannel(label: string): void;
    closeChannels(): void;
    close(): void;
}

interface IDispatcher extends IBase {
}
class Dispatcher extends Base {
    signaler: Signaler;
    rooms: Rooms;
    constructor(signaler: Signaler, rooms: Rooms);
    destroy(): void;
    initEvents(): void;
    unInitEvents: () => void;
    onJoinRoom: (query: IUserQuery) => void;
    onLeaveRoom: (query: IUserQuery) => void;
    onCloseRoom: (query: IUserQuery) => void;
    onMessage: (query: IUserQuery) => void;
}

enum EInputEvents {
    onDispatchEvent = "onDispatchEvent",
    onInputEvent = "onInputEvent",
    onTouchModeEvent = "onTouchModeEvent"
}
enum EInputDevice {
    mouse = "mouse",
    touch = "touch",
    keyboard = "keyboard"
}
enum EInputDeviceMouseType {
    mousedown = "mousePressed",
    mouseup = "mouseReleased",
    mouseenter = "mouseEnter",
    mouseleave = "mouseLeave",
    mousemove = "mouseMoved",
    mouseover = "mouseOver",
    mouseout = "mouseOut",
    wheel = "mouseWheel"
}
enum EInputDeviceTouchType {
    touchstart = "touchStart",
    touchmove = "touchMove",
    touchend = "touchEnd",
    touchcancel = "touchCancel"
}
enum EInputDeviceKeyType {
    keyDown = "keyDown",
    keyUp = "keyUp",
    rawKeyDown = "rawKeyDown",
    char = "char"
}
enum EInputOS {
    window = "window",
    android = "android"
}
enum EInputPlatform {
    browser = "browser",
    reactnative = "reactnative"
}
interface IInputPoint {
    x: number;
    y: number;
}
interface ITouchPoint {
    x: number;
    y: number;
    radiusX?: number;
    radiusY?: number;
    rotationAngle?: number;
    force?: number;
    id?: number;
    deltaX?: number;
    deltaY?: number;
}
interface ITouchEvent extends ICavansEvent {
    type?: EInputDeviceTouchType;
    touchPoints?: Array<ITouchPoint>;
    touches?: Array<ITouchPoint>;
    changedTouches?: Array<ITouchPoint>;
}
interface IMousePoint {
    x: number;
    y: number;
    button?: 'none' | 'left' | 'middle' | 'right';
    clickCount?: number;
    deltaX?: number;
    deltaY?: number;
}
interface IMouseEvent extends ICavansEvent, IMousePoint {
    type?: EInputDeviceMouseType;
}
interface ICavansEvent {
    OS?: EInputOS;
    platform?: EInputPlatform;
    touchMode?: EInputDevice;
    modifiers?: number;
    timestamp?: number;
    sourceX?: number;
    sourceY?: number;
    destX?: number;
    destY?: number;
    async?: boolean;
}
type IInputEvent = ITouchEvent | IMouseEvent;
class Input extends Base {
    OS: EInputOS;
    platform: EInputPlatform;
    touchMode: EInputDevice;
    datachannel: DataChannel;
    datachannels: DataChannels;
    gesture: Gesture;
    constructor(datachannels: DataChannels);
    destroy(): void;
    initEvents(): void;
    unInitEvents(): void;
    onAddDataChannel: (datachannel: DataChannel) => void;
    unInitDataChannelEvents(): void;
    onDataChannelMessage: (ev: MessageEvent) => void;
    onDataChannelOpen: () => void;
    onDataChannelClose: () => void;
    dispatchEvent(event: IInputEvent): void;
    inputEvent(event: IInputEvent): void;
    sendEvent(event: IInputEvent): Promise<any>;
}

enum ERTCPeerEvents {
    onconnectionstatechange = "connectionstatechange",
    ondatachannel = "datachannel",
    onicecandidate = "icecandidate",
    onicecandidateerror = "icecandidateerror",
    oniceconnectionstatechange = "iceconnectionstatechange",
    onicegatheringstatechange = "icegatheringstatechange",
    onnegotiationneeded = "negotiationneeded",
    onsignalingstatechange = "signalingstatechange",
    onstatsended = "statsended",
    ontrack = "track",
    onstream = "stream",
    onaddstream = "addstream",
    onrecvstream = "onrecvstream",
    onrecvstreaminactive = "onrecvstreaminactive",
    onsendstreaminactive = "onsendstreaminactive"
}
enum EPeerEvents {
    ongetconfig = "ongetconfig"
}
class Peer extends Base {
    config: Config;
    user: IUser;
    streams: Streams;
    datachannels: DataChannels;
    input: Input;
    constructor(user: IUser);
    destroy(): void;
    close(): void;
    initEvents(): void;
    unInitEvents(): void;
    initRTCEvents(rtc: RTCPeerConnection): void;
    unInitRTCEvents(rtc: RTCPeerConnection): void;
    rtc(): RTCPeerConnection;
    doICE(stream: MediaStream): Promise<any>;
    addSendStream(stream: MediaStream): boolean;
    getConfig(): Config;
    createDataChannels(): void;
    createOffer(): Promise<any>;
    sendOffer(sdp?: RTCSessionDescriptionInit): Promise<any>;
    createAnswer(): Promise<any>;
    createAnswer_reactnative(): Promise<any>;
    createAnswer_browser(): Promise<any>;
    sendAnswer(sdp?: RTCSessionDescriptionInit): Promise<any>;
    onIceCandidate: (ev: RTCPeerConnectionIceEvent) => Promise<any>;
    stopSharing(): Promise<any>;
    onOffer: (data: any) => void;
    onOffer_browser: (data: any) => void;
    onOffer_reactnative: (data: any) => void;
    onAnswer: (data: any) => void;
    onCandidate: (data: any) => void;
    onCandidate_browser: (data: any) => void;
    onCandidate_reactnative: (data: any) => void;
    onIceComplete: () => void;
    onTrack: (ev: RTCTrackEvent) => void;
    onStream: (ev: any) => void;
    onAddStream: (ev: Event) => void;
    onRecvStream: (stream: MediaStream) => void;
}

enum ERoomEvents {
    onadduser = "onadduser",
    ondeluser = "ondeluser"
}
interface IRoomParams {
    roomid: string;
    password: string;
    max?: number;
    Signaler?: Signaler;
}
interface IRoom extends IBase, IRoomParams {
    users: {
        [id: string]: IUser;
    };
    streams: Streams;
    getOwner(): IUser;
    isOwner(socketId: string): boolean;
    addUser(user: IUser): IUser;
    delUser(socketId: string): any;
    currUser(): IUser;
    addSendStream(stream: MediaStream, user?: IUser): any;
}
class Room extends Base implements IRoom {
    roomid: string;
    password: string;
    max: number;
    signaler: Signaler;
    users: {
        [id: string]: IUser;
    };
    streams: Streams;
    constructor(room: IRoomParams);
    destroy(): void;
    initEvents(): void;
    unInitEvents(): void;
    onJoinRoom: (query: IUserQuery) => void;
    onLeaveRoom: (query: IUserQuery) => void;
    onCloseRoom: (query: IUserQuery) => void;
    onMessage: (query: IUserQuery) => void;
    onRecvStream: (stream: MediaStream, user: IUser) => void;
    onIceConnectionStateChange: (ev: RTCTrackEvent, user: IUser) => void;
    getOwner(): IUser;
    isOwner(socketId: string): boolean;
    addUser(user: IUser): IUser;
    delUser(socketId: string): void;
    clearUsers(): void;
    getUser(socketId: string): IUser;
    getUsers(): Array<IUser>;
    currUser(): IUser;
    addSendStream(stream: MediaStream, user?: IUser): void;
    sendStreamsToUser(user?: IUser): void;
    close(): void;
    userCount(): number;
}

enum ERoomsEvents {
    onnewroom = "onnewroom"
}
class Rooms extends Base {
    signaler: Signaler;
    rooms: {
        [id: string]: Room;
    };
    constructor(signaler: Signaler);
    destroy(): void;
    initEvents(): void;
    unInitEvents(): void;
    count(): number;
    userCount(): number;
    onCloseRoom: (query: IUserQuery) => void;
    newRoom(roomid: string, password?: string): Room;
    getRoom(roomid: string): Room;
    delRoom(roomid: string): void;
    close(): void;
}

interface ISignalerMessage {
    type: ESignalerMessageType;
    data?: any;
}
enum ESignalerMessageType {
    offer = "message-offer",
    answer = "message-answer",
    candidate = "message-candidate",
    icecomplete = "message-icecomplete",
    hello = "message-hello",
    ready = "message-ready"
}
class Signaler extends Client {
}

class Streams extends Base {
    owner: any;
    sendStreams: {
        [id: string]: MediaStream;
    };
    recvStreams: {
        [id: string]: MediaStream;
    };
    constructor(owner: any);
    destroy(): void;
    addSendStream(stream: MediaStream): void;
    removeSendStream(id: string): void;
    getSendStream(id: string): MediaStream;
    getSendStreams(): Array<MediaStream>;
    onSendStreamInactive(stream: MediaStream): void;
    stopSendStreams(): Promise<any>;
    stopSendStream(id: string): Promise<any>;
    addRecvStream(stream: MediaStream): void;
    removeRecvStream(id: string): void;
    getRecvStream(id: string): MediaStream;
    getRecvStreams(): Array<MediaStream>;
    onRecvStreamInactive(stream: MediaStream): void;
    stopRecvStreams(): Promise<any>;
    stopRecvStream(id: string): Promise<any>;
}

interface IUserParams {
    socketId: string;
    isOwner: boolean;
    isReady?: boolean;
    signaler?: Signaler;
    peer?: Peer;
    room?: Room;
    streams?: Streams;
    video?: HTMLVideoElement;
}
interface IUser extends IBase, IUserParams {
    initEvents(): any;
    unInitEvents(): any;
    onMessage(query: IUserQuery): any;
    onReady(query: IUserQuery): any;
    stopSharing(): Promise<any>;
    imReady(): any;
    sayHello(to?: string): any;
    addSendStream(stream: MediaStream): any;
    addSendStreams(streams: Array<MediaStream>): any;
    doICE(): any;
    sendMessage(msg: any): any;
    close(): any;
}
class User extends Base implements IUser {
    socketId: string;
    isOwner: boolean;
    isReady: boolean;
    signaler: Signaler;
    peer: Peer;
    room: Room;
    streams: Streams;
    constructor(user: IUserParams);
    destroy(): void;
    close(): void;
    initEvents(): void;
    unInitEvents(): void;
    onMessage: (query: IUserQuery) => void;
    onReady(query: IUserQuery): void;
    onIceConnectionStateChange: (ev: Event) => void;
    onRecvStream: (stream: MediaStream) => void;
    stopSharing(): Promise<any>;
    imReady(): Promise<any>;
    sayHello(to?: string): Promise<any>;
    sendMessage(msg: any): Promise<any>;
    addSendStream(stream: MediaStream): void;
    addSendStreams(streams: Array<MediaStream>): void;
    doICE(): void;
    isCurrUser(): boolean;
}

var WebRTC: any;
function AssignWebRTC(rnWebRTC: any): void;
{ WebRTC, AssignWebRTC };

class Gesture extends Base {
    input: Input;
    touchCount: number;
    constructor(input: Input);
    destroy(): void;
    inputEvent(event: IInputEvent): void;
    dealInputEvent(event: IInputEvent): void;
    inputEventWindow(event: IInputEvent): void;
    inputEventAndroid(event: IInputEvent): void;
    inputEventWindowBrowser(event: IInputEvent): void;
    inputEventAndroidBrowser(event: IInputEvent): void;
    inputEventAndroidReactnative(event: IInputEvent): void;
    calcInputEventXY(point: IInputPoint, source: IInputPoint, dest: IInputPoint): IInputPoint;
    changeTouchMode(): void;
    handleMouseEvent(evt: IMouseEvent): void;
    handleTouchEvent(event: ITouchEvent): void;
    handleTouchToMouseEvent(event: ITouchEvent): void;
}

