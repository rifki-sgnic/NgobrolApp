import { AttachFile, InsertEmoticon, Mic, MoreVert } from "@mui/icons-material";
import { Avatar, IconButton } from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import TimeAgo from "timeago-react";
import { auth, db } from "../firebase";
import getReceiverEmail from "../utils/getReceiverEmail";
import Message from "./Message";

const ChatScreen = ({ chat, messages }) => {
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const router = useRouter();
  const endOfMessagesRef = useRef(null);

  const chatRef = doc(collection(db, "chats"), router.query.id);
  const q = query(collection(chatRef, "messages"), orderBy("timestamp", "asc"));
  const [messagesSnapshot] = useCollection(q);

  const receiverQuery = query(
    collection(db, "users"),
    where("email", "==", getReceiverEmail(chat.users, user))
  );
  const [receiverSnapshot] = useCollection(receiverQuery);

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate().getTime(),
          }}
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message key={message.id} user={message.user} message={message} />
      ));
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  if (endOfMessagesRef.current !== null) {
    scrollToBottom();
  }

  const sendMessage = (e) => {
    e.preventDefault();
    setDoc(
      doc(collection(db, "users"), user.uid),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

    addDoc(
      collection(doc(collection(db, "chats"), router.query.id), "messages"),
      {
        timestamp: serverTimestamp(),
        message: input,
        user: user.email,
        photoURL: user.photoURL,
      }
    );

    setInput("");
    scrollToBottom();
  };

  const receiver = receiverSnapshot?.docs?.[0]?.data();
  const receiverEmail = getReceiverEmail(chat.users, user);

  return (
    <>
      <div className="sticky bg-white z-50 top-0 flex p-4 border-b border-slate-100 h-20 items-center">
        {receiver ? (
          <Avatar src={receiver?.photoURL} />
        ) : (
          <Avatar>{receiverEmail[0]}</Avatar>
        )}
        <div className="ml-4 flex-1">
          <h3 className="font-medium text-lg mb-1">{receiverEmail}</h3>
          {receiverSnapshot ? (
            <p className="text-sm text-gray-400">
              Last Active:{" "}
              {receiver?.lastSeen?.toDate() ? (
                <TimeAgo datetime={receiver?.lastSeen?.toDate()} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-400">Loading ...</p>
          )}
        </div>
        <div>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className="p-8 bg-slate-600" style={{ minHeight: "83vh" }}>
        {showMessages()}
        <div ref={endOfMessagesRef}></div>
      </div>
      <form className="flex sticky bottom-0 p-3 items-center bg-white z-50">
        <InsertEmoticon />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 outline-none border-none rounded-xl bg-gray-100 p-5 mx-4"
        />
        <Mic />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send Message
        </button>
      </form>
    </>
  );
};

export default ChatScreen;
