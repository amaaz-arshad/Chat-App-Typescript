import React, { useEffect, useState } from "react";
import { db, auth, storage, actionCodeSettings, messaging } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import User from "../components/User";
import MessageForm from "../components/MessageForm";
import Message from "../components/Message";
import { sendSignInLinkToEmail, signOut } from "firebase/auth";
import { CircularProgress } from "@mui/material";
import { getToken } from "firebase/messaging";
import { getMessaging, onMessage } from "firebase/messaging";
import { useNavigate } from "react-router-dom";
import { Image, Messages, Users } from "../model";

const Home = () => {
  const [users, setUsers] = useState<Users[]>([]);
  // @ts-ignore
  const [chat, setChat] = useState<Users>("");
  const [text, setText] = useState<string>("");
  // @ts-ignore
  const [img, setImg] = useState<Image>("");
  // const [fileName, setfileName] = useState("");
  const [msgs, setMsgs] = useState<Messages[]>([]);
  const [email, setEmail] = useState<string>("");
  const [inviteLoading, setInviteLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  // const [progress, setProgress] = useState(0);
  const [isMsgSending, setIsMsgSending] = useState<boolean>(false);
  const [isfileAttached, setIsfileAttached] = useState<boolean>(false);
  const [tabHasFocus, setTabHasFocus] = useState<boolean>(true);
  const navigate = useNavigate();
  // @ts-ignore
  const user1: string = auth.currentUser?.uid;
  let fileName: string = "";
  let timer: number;

  useEffect(() => {
    const handleFocus = () => {
      console.log("Tab has focus");
      setTabHasFocus(true);
      clearTimeout(timer);
    };

    const handleBlur = () => {
      console.log("Tab lost focus");
      setTabHasFocus(false);
      // @ts-ignore
      timer = setTimeout(async () => {
        // handleSignout();
        console.log("Session expired. Logging out...");
        // @ts-ignore
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          isOnline: false,
        });
        await signOut(auth);
        navigate("/login");
      }, 3600000);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      // ...
    });
    function requestPermission() {
      console.log("Requesting permission...");
      Notification.requestPermission().then((permission) => {
        console.log(permission);
        if (permission === "granted") {
          getToken(messaging, {
            vapidKey: process.env.REACT_APP_VAPID_KEY,
          })
            .then((currentToken) => {
              if (currentToken) {
                console.log("token:", currentToken);
                // @ts-ignore
                updateDoc(doc(db, "users", auth.currentUser.uid), {
                  token: currentToken,
                });
                //setToken(currentToken);
                // Send the token to your server and update the UI if necessary
                // ...
              } else {
                // Show permission request UI
                console.log(
                  "No registration token available. Request permission to generate one."
                );
                // ...
              }
            })
            .catch((err) => {
              console.log("An error occurred while retrieving token. ", err);
              // ...
            });
        }
      });
    }
    requestPermission();
  }, []);

  useEffect(() => {
    // swDev();
    const usersRef = collection(db, "users");
    // create query object
    const q = query(usersRef, where("uid", "not-in", [user1]));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users: Users[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      console.log("users:", users);
      setUsers(users);
    });
    return () => unsub();
  }, []);

  const selectUser = async (user: Users) => {
    setChat(user);

    const user2 = user.uid;
    // @ts-ignore
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (querySnapshot) => {
      let msgs: Messages[] = [];
      querySnapshot.forEach((doc) => {
        // console.log({ ...doc.data(), id: doc.id });
        // @ts-ignore
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMsgs(msgs);
    });

    // get last message b/w logged in user and selected user
    const docSnap = await getDoc(doc(db, "lastMsg", id));
    // if last message exists and message is from selected user
    if (docSnap.data() && docSnap.data()?.from !== user1) {
      // update last message doc, set unread to false
      await updateDoc(doc(db, "lastMsg", id), { unread: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("chat:", chat);

    setIsMsgSending(true);
    const user2 = chat.uid;
    // @ts-ignore
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let url;
    try {
      if (img) {
        console.log("file in home:", img);
        fileName = img.name;
        const imgRef = ref(
          storage,
          `images/${new Date().getTime()} - ${img.name}`
        );
        // @ts-ignore
        const snap = await uploadBytes(imgRef, img);
        // snap.on("state_changed", (snapshot) => {
        //   const prog = Math.round(
        //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        //   );
        //   setProgress(prog);
        // });
        const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
        url = dlUrl;
      }

      setText("");
      // @ts-ignore
      setImg("");
      setIsMsgSending(false);
      setIsfileAttached(false);
    } catch (error) {
      console.log(error);
      setIsMsgSending(false);
    }

    if (text || img) {
      await addDoc(collection(db, "messages", id, "chat"), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        fileName,
      });

      await setDoc(doc(db, "lastMsg", id), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        fileName,
        unread: true,
      });

      let body = {
        to: chat.token,
        notification: {
          title: `Message from ${auth?.currentUser?.displayName}`,
          body: text,
          icon: url,
        },
      };
      console.log(body);

      let options = {
        method: "POST",
        headers: new Headers({
          Authorization: `key=${process.env.REACT_APP_SERVER_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(body),
      };

      fetch("https://fcm.googleapis.com/fcm/send", options)
        .then((res) => {
          console.log("SENT");
          console.log(res);
        })
        .catch((err) => {
          console.log("Error:", err);
        });
    }
  };

  return (
    <div className="home_container">
      <div className="users_container">
        <h3 className="available-chats">Available Chats</h3>

        {users.map((user) => (
          <User
            key={user.uid}
            user={user}
            selectUser={selectUser}
            user1={user1}
            chat={chat}
          />
        ))}
      </div>
      <div className="messages_container">
        {chat ? (
          <>
            <div className="messages_user">
              <h3>{chat.name}</h3>
            </div>

            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message key={i} msg={msg} user1={user1} />
                  ))
                : null}
            </div>
            {isfileAttached && (
              <div className="file-attach-msg">( file attached )</div>
            )}
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              setText={setText}
              img={img}
              setImg={setImg}
              isMsgSending={isMsgSending}
              setIsfileAttached={setIsfileAttached}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )}
      </div>
    </div>
  );
};

export default Home;
