// import * as adapter from "webrtc-adapter";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

export default function App(): ReactNode {
  const [disabled,setDisabled] = useState(false);
  const [dataChann,setDataChann] = useState<RTCDataChannel>();
  const [messages,setMessages] = useState<readonly ReactNode[]>([]);

  const v1 = useRef<HTMLVideoElement>(null);
  const v2 = useRef<HTMLVideoElement>(null);
  const offer = useRef<HTMLTextAreaElement>(null);
  const answer = useRef<HTMLTextAreaElement>(null);
  const chat = useRef<HTMLInputElement>(null);
  const peerConn = useRef(new RTCPeerConnection({
    iceServers: [{
      urls: "stun:stun.l.google.com:19302"
    }]
  }));
  const requestMedia = useRef<MediaStream>();

  const dataChannInit = useCallback(() => {
    dataChann?.addEventListener("open",() => {
      sendMessage("Chat!");
    });
    dataChann?.addEventListener("message",event => {
      sendMessage(event.data);
    });
  },[]);

  const createOffer = useCallback(() => {
    setDisabled(true);

    setDataChann(peerConn.current.createDataChannel("chat"))
    dataChannInit();

    peerConn.current.createOffer();
    peerConn.current.setLocalDescription(void 0);
    peerConn.current.addEventListener("icecandidate",event => {
      if (event.candidate) return;
      offer.current!.value = peerConn.current.localDescription?.sdp ?? "";
      offer.current!.select();
      answer.current!.placeholder = "Paste answer here";
    });
  },[]);

  const sendMessage = useCallback((msg: ReactNode) => {
    setMessages([...messages,msg]);
  },[]);

  useEffect(() => {
    (async () => {
      try {
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        peerConn.current.addStream(v1.current!.srcObject = stream);
        requestMedia.current = stream;
      } catch (error){
        sendMessage(`${error}`);
        throw error;
      }
    })();
  },[]);

  return (
    <>
      <video id="v1" ref={v1} height="120" width="160" autoPlay muted/>
      <video id="v2" ref={v2} height="120" width="160" autoPlay/>
      <br/>
      <button id="button" disabled={disabled} onClick={createOffer}>Offer:</button>
      <textarea id="offer" ref={offer} placeholder="Paste offer here" disabled={disabled} onKeyDown={async event => {
        if (event.key !== "Enter" || peerConn.current.signalingState !== "stable") return;
        setDisabled(true);

        const desc = new RTCSessionDescription({
          type: "offer",
          sdp: offer.current!.value
        });
        console.log(desc);

        peerConn.current.addEventListener("icecandidate",event => {
          if (event.candidate) return;
          answer.current!.focus();
          answer.current!.value = peerConn.current.localDescription?.sdp ?? "";
          answer.current!.select();
          console.log(peerConn.current.localDescription?.sdp);
        });

        try {
          await peerConn.current.setRemoteDescription(desc);
          const descr = await peerConn.current.createAnswer();
          console.log(descr);
          peerConn.current.setLocalDescription(descr);
        } catch (error){
          sendMessage(`${error}`);
          throw error;
        }
      }}/>
      <br/>
      Answer:
      <textarea id="answer" ref={answer} onKeyDown={async event => {
        if (event.key !== "Enter" || peerConn.current.signalingState !== "have-local-offer") return;
        answer.current!.disabled = true;
        try {
          await peerConn.current.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: answer.current!.value
          }));
        } catch (error){
          sendMessage(`${error}`);
          throw error;
        }
      }}/>
      <br/>
      <div id="div">
        {messages.map((msg,i) => <p id={`message#${i}`}>{msg}</p>)}
      </div>
      Chat:
      <input id="chat" ref={chat} onKeyDown={event => {
        if (event.key !== "Enter") return;
        dataChann!.send(chat.current!.value);
      }}/>
      <br/>
    </>
  );
}