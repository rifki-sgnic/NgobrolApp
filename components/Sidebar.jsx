import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import * as EmailValidator from "email-validator";
import { signOut } from "firebase/auth";
import { addDoc, collection, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase";
import Chat from "./Chat";

const Sidebar = ({ hidden }) => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );
  const [chatsSnapshot] = useCollection(userChatRef);

  const [email, setEmail] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const handleDialogOpen = () => {
    setFormDialogOpen(true);
  };

  const handleDialogClose = () => {
    setFormDialogOpen(false);
  };

  const createChat = () => {
    if (!email) return null;

    if (
      EmailValidator.validate(email) &&
      !chatExists(email) &&
      email !== user.email
    ) {
      // add the chat to db into the DB 'chats' collection if it doesn't already exist and is valid
      addDoc(collection(db, "chats"), {
        users: [user.email, email],
      });
    }
    setFormDialogOpen(false);
    setEmail("");
  };

  const chatExists = (receiverEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === receiverEmail)?.length > 0
    );

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMoreClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const signOutHandler = () => {
    signOut(auth).then(() => {
      router.replace("/");
    });
  };

  return (
    <div
      className={`h-screen w-full lg:w-72 overflow-y-auto border-r border-gray-100 ${
        hidden && "hidden"
      } lg:block`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between h-20 p-4 bg-white border-b border-gray-100">
        <Avatar
          src={user.photoURL}
          className="cursor-pointer hover:opacity-80"
        />
        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton
            onClick={handleMoreClick}
            aria-controls={open ? "more-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="more-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={signOutHandler}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </div>
      <div className="flex items-center p-5 rounded-sm">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search in chats"
          className="flex-1 border-none outline-none"
        />
      </div>
      <Button
        className="w-full text-black border-gray-100 hover:bg-gray-100"
        sx={{ borderTop: 1, borderBottom: 1 }}
        onClick={handleDialogOpen}
      >
        Start a new chat
      </Button>
      <Dialog open={formDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Start a new chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To start a new chat, please enter email address here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mrifki028@gmail.com"
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button onClick={createChat}>Add to chat</Button>
        </DialogActions>
      </Dialog>

      {/* List of chats */}
      {chatsSnapshot?.docs.map((chat) => (
        <Chat key={chat.id} id={chat.id} users={chat.data().users} />
      ))}
    </div>
  );
};

export default Sidebar;
