import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, IconButton } from "@mui/material";
import * as EmailValidator from "email-validator";
import { signOut } from "firebase/auth";
import { addDoc, collection, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase";
import Chat from "./Chat";

function Sidebar() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );
  const [chatsSnapshot] = useCollection(userChatRef);

  const createChat = () => {
    const input = prompt("Email address you want to chat with");

    if (!input) return null;

    if (
      EmailValidator.validate(input) &&
      !chatExists(input) &&
      input !== user.email
    ) {
      // add the chat to db into the DB 'chats' collection if it doesn't already exist and is valid
      addDoc(collection(db, "chats"), {
        users: [user.email, input],
      });
    }
  };

  const chatExists = (receiverEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === receiverEmail)?.length > 0
    );

  const signOutHandler = () => {
    signOut(auth).then(() => {
      router.replace("/");
    });
  };

  return (
    <div className="h-screen overflow-y-auto border-r border-gray-100">
      <div className="flex sticky top-0 bg-white z-10 justify-between items-center p-4 h-20 border-b border-gray-100">
        <Avatar
          src={user.photoURL}
          className="cursor-pointer hover:opacity-80"
          onClick={signOutHandler}
        />
        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center p-5 rounded-sm">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search in chats"
          className="outline-none border-none flex-1"
        />
      </div>
      <Button
        className="w-full border-gray-100 text-black hover:bg-gray-100"
        sx={{ borderTop: 1, borderBottom: 1 }}
        onClick={createChat}
      >
        Start a new chat
      </Button>

      {/* List of chats */}
      {chatsSnapshot?.docs.map((chat) => (
        <Chat key={chat.id} id={chat.id} users={chat.data().users} />
      ))}
    </div>
  );
}

export default Sidebar;
