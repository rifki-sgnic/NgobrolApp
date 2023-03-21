import { Avatar, Badge } from "@mui/material";
import { collection, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase";
import getReceiverEmail from "../utils/getReceiverEmail";
import VerifiedIcon from "@mui/icons-material/Verified";

const Chat = ({ id, users }) => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const receiverEmail = getReceiverEmail(users, user);
  const receiverRef = query(
    collection(db, "users"),
    where("email", "==", getReceiverEmail(users, user))
  );
  const [receiverSnapshot] = useCollection(receiverRef);
  const receiver = receiverSnapshot?.docs?.[0]?.data();

  const enterChat = () => {
    router.push(`/chat/${id}`);
  };

  return (
    <div
      className="flex items-center p-4 break-words border-b border-gray-100 cursor-pointer hover:bg-gray-100"
      onClick={enterChat}
    >
      {receiver ? (
        receiver?.email === "mrifki028@gmail.com" ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={<VerifiedIcon className="text-sky-500" />}
          >
            <Avatar src={receiver?.photoURL} className="m-1" />
          </Badge>
        ) : (
          <Avatar src={receiver?.photoURL} className="m-1" />
        )
      ) : (
        <Avatar className="m-1">{receiverEmail[0]}</Avatar>
      )}
      <p className="ml-3">{receiverEmail}</p>
    </div>
  );
};

export default Chat;
