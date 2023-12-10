// import * as adapter from "webrtc-adapter";
import { useEffect, useRef } from "react";

import type { ReactNode, RefObject } from "react";

export default function App(): ReactNode {
  const dataChann = useRef<RTCDataChannel>(null);
  const v1 = useRef<HTMLVideoElement>(null);
  const v2 = useRef<HTMLVideoElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const offer = useRef<HTMLTextAreaElement>(null);
  const answer = useRef<HTMLTextAreaElement>(null);
  const div = useRef<HTMLDivElement>(null);
  const chat = useRef<HTMLInputElement>(null);

  function dataChannInit(dataChann: RTCDataChannel): void {
    dataChann.addEventListener("open",() => {
      sendMessage("Chat!");
    });
    dataChann.addEventListener("message",event => {
      sendMessage(event.data);
    });
  }

  function createOffer(button: RefObject<HTMLButtonElement>, peerConn: RefObject<RTCPeerConnection>): void {
    button.current!.disabled = true;
    dataChannInit(dataChann.current = peerConn.current!.createDataChannel("chat"));
  }

  function sendMessage(msg: ReactNode): void {
    div.current!.innerHTML += `<p>${msg}</p>`;
  }

  useEffect(() => {
    const peerConn = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    });

    peerConn.addEventListener("addstream",event => {
      v2.current.srcObject = event.stream;
    });
    peerConn.addEventListener("datachannel",event => {
      dataChannInit(dataChann = event.channel);
    });
    peerConn.addEventListener("iceconnectionstatechange",() => {
      sendMessage(peerConn.iceConnectionState);
    });

    const requestMedia = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => peerConn.addStream(v1.current.srcObject = stream)).catch(sendMessage);
  },[]);

  return (
    <>
      <video id="v1" ref={v1} height="120" width="160" autoPlay muted/>
      <video id="v2" ref={v2} height="120" width="160" autoPlay/>
      <br/>
      <button id="button" ref={button} onClick={createOffer}>Offer:</button>
      <textarea id="offer" ref={offer} placeholder="Paste offer here"/>
      <br/>
      Answer:
      <textarea id="answer" ref={answer}/>
      <br/>
      <div id="div" ref={div}/>
      Chat:
      <input id="chat" ref={chat}/>
      <br/>
    </>
  );
}