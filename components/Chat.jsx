import { Avatar } from "@mui/material";
import { collection, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase";
import getReceiverEmail from "../utils/getReceiverEmail";

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
      className="flex items-center cursor-pointer p-4 break-words hover:bg-gray-100"
      onClick={enterChat}
    >
      {receiver ? (
        <Avatar src={receiver?.photoURL} className="m-1 mr-4" />
      ) : (
        <Avatar className="m-1 mr-4">{receiverEmail[0]}</Avatar>
      )}
      <p>{receiverEmail}</p>
    </div>
  );
};

export default Chat;
