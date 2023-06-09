import AttachFile from "@mui/icons-material/AttachFile";
import InsertEmoticon from "@mui/icons-material/InsertEmoticon";
import Mic from "@mui/icons-material/Mic";
import MoreVert from "@mui/icons-material/MoreVert";
import ArrowBack from "@mui/icons-material/ArrowBack";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Avatar, Badge, IconButton } from "@mui/material";
import {
  addDoc,
  collection,
  doc,
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

  const backToChatList = () => {
    router.replace("/");
  };

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
      <div className="sticky top-0 z-50 flex items-center h-20 p-4 bg-white border-b border-slate-100">
        <IconButton
          className="flex gap-x-2 rounded-3xl"
          onClick={backToChatList}
        >
          <ArrowBack />
          {receiver ? (
            receiver?.email === "mrifki028@gmail.com" ? (
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <VerifiedIcon className="mt-1 ml-1 text-sky-500" />
                }
              >
                <Avatar src={receiver?.photoURL} />
              </Badge>
            ) : (
              <Avatar src={receiver?.photoURL} />
            )
          ) : (
            <Avatar>{receiverEmail[0]}</Avatar>
          )}
        </IconButton>
        <div className="flex-1 ml-2 lg:ml-4">
          <h3 className="mb-1 text-base font-medium lg:text-lg">
            {receiverEmail}
          </h3>
          {receiverSnapshot ? (
            <p className="text-xs text-gray-400 lg:text-sm">
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
      <div className="p-8 bg-sky-800" style={{ minHeight: "83vh" }}>
        {showMessages()}
        <div ref={endOfMessagesRef}></div>
      </div>
      <form className="sticky bottom-0 z-50 flex items-center p-3 bg-white">
        <InsertEmoticon />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-5 mx-4 bg-gray-100 border-none outline-none rounded-xl"
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
