declare global {
  interface RTCPeerConnection {
    /**
     * The obsolete {@link RTCPeerConnection} method `addStream()` adds a {@link MediaStream} as a local source of audio or video. Instead of using this obsolete method, you should instead use {@link RTCPeerConnection.addTrack} once for each track you wish to send to the remote peer.
     * 
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream)
     * 
     * @deprecated
    */
    addStream(mediaStream: MediaStream): void;
  }
}

export {};