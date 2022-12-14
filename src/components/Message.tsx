import React, { useRef, useEffect, useState } from "react";
import Moment from "react-moment";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Messages } from "../model";

interface Props {
  msg: Messages;
  user1: string;
}

const Message = ({ msg, user1 }: Props) => {
  const scrollRef = useRef<HTMLInputElement>(null);
  const [displayToggle, setDisplayToggle] = useState(false);

  async function deleteMsg(msgId: string) {
    console.log("delete btn was clicked");
    console.log(msg);
    setDisplayToggle(!displayToggle);
    const id =
      msg.from > msg.to ? `${msg.from + msg.to}` : `${msg.to + msg.from}`;
    await deleteDoc(doc(db, "messages", id, "chat", msgId));
    // console.log("msg deleted");
    // let delid: string;
    // const q = query(collection(db, "lastMsg"), where("id", "==", msgId));
    // const querySnapshot = await getDocs(q);
    // querySnapshot.forEach(async (doc) => {
    //   // doc.data() is never undefined for query doc snapshots
    //   console.log("query snapshot executed");
    //   console.log(doc.id, " => ", doc.data());
    //   delid = doc.id;
    // });

    // await deleteDoc(doc(db, "lastMsg", delid));

  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);
  return (
    <div
      className={`message_wrapper ${msg.from === user1 ? "own" : ""}`}
      ref={scrollRef}
    >
      <p className={msg.from === user1 ? "me" : "friend"}>
        <span className="menu">
          <MoreHorizIcon
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setDisplayToggle(!displayToggle);
            }}
          />
        </span>
        {/* submenu */}
        <div
          className="submenu"
          style={{ display: displayToggle ? "block" : "none" }}
          onClick={() => {
            deleteMsg(msg.id);
          }}
        >
          Delete
        </div>
        {/* <img src={msg.media} alt={msg.text} />  */}
        {msg.media ? (
          <a target="_blank" className="attachment-link" href={msg.media}>
            <div
              className={msg.from === user1 ? "msg-me" : "msg-friend"}
              style={{
                padding: "0 10px 20px 5px",
                borderRadius: "5px",
                marginBottom: "2px",
              }}
            >
              {/* <div> */}
              <InsertDriveFileIcon
                style={{
                  cursor: "pointer",
                  fontSize: "35px",
                  position: "relative",
                  top: "12px",
                }}
              />
              <span style={{ fontSize: "13px" }}> {msg.fileName} </span>
              {/* </div> */}
            </div>
          </a>
        ) : null}
        {msg.text ? <span>{msg.text}</span> : null}

        <div style={{ textAlign: "right" }}>
          <small>
            <Moment fromNow>{msg.createdAt.toDate()}</Moment>
          </small>
        </div>
      </p>
    </div>
  );
};

export default Message;
