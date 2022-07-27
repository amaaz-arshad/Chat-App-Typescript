import React from "react";
import Attachment from "./svg/Attachment";
import { CgAttachment } from "react-icons/cg";
import { CircularProgress } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { Image } from "../model";

interface Props {
  handleSubmit: (e: React.FormEvent) => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  img: Image;
  setImg: React.Dispatch<React.SetStateAction<Image>>;
  isMsgSending: boolean;
  setIsfileAttached: React.Dispatch<React.SetStateAction<boolean>>;
}

const MessageForm = ({
  handleSubmit,
  text,
  setText,
  img,
  setImg,
  isMsgSending,
  setIsfileAttached,
}: Props) => {
  return (
    <form className="message_form" onSubmit={handleSubmit}>
      <label htmlFor="img">
        <CgAttachment
          style={{
            color: "silver",
            fontSize: "25px",
            position: "relative",
            bottom: "3px",
            cursor: "pointer",
          }}
        />
        {/* <ImageIcon
          sx={{
            color: "gray",
            fontSize: "30px",
            position: "relative",
            bottom: "5px",
          }}
        /> */}
      </label>
      <input
        onChange={(e) => {
          // @ts-ignore
          setImg(e.target.files[0]);
          setIsfileAttached(true);
        }}
        type="file"
        id="img"
        // accept="image/*"
        style={{ display: "none" }}
      />
      <div>
        <input
          type="text"
          placeholder="Enter message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        {isMsgSending ? (
          <button className="btn-loading" disabled>
            <CircularProgress color="inherit" size={15} />
          </button>
        ) : (
          (text || img) && <button className="btn">Send</button>
        )}
      </div>
    </form>
  );
};

export default MessageForm;
