import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import ChatScreen from "../../../components/ChatScreen";
import Sidebar from "../../../components/Sidebar";
import { auth, db } from "../../../firebase";
import getReceiverEmail from "../../../utils/getReceiverEmail";

const Chat = ({ messages, chat }) => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  return (
    <div className="flex">
      <Head>
        <title>Chat with {getReceiverEmail(chat.users, user)}</title>
      </Head>
      {router.pathname === "/" ? <Sidebar /> : <Sidebar hidden />}
      <div className="flex-1 h-screen overflow-y-auto scrollbar-hide">
        <ChatScreen chat={chat} messages={messages} />
      </div>
    </div>
  );
};

export default Chat;

export const getServerSideProps = async (context) => {
  const ref = doc(db, "chats", context.query.id);

  // prep messages on the server
  // const messageRes = await ref.collection('messages').order('timestamp', 'asc').get();
  const q = query(collection(ref, "messages"), orderBy("timestamp", "asc"));
  const messageRes = await getDocs(q);

  const messages = messageRes.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .map((messages) => ({
      ...messages,
      timestamp: messages.timestamp.toDate().getTime(),
    }));

  // prep the chats
  const chatRes = await getDoc(ref);
  const chat = {
    id: chatRes.id,
    ...chatRes.data(),
  };

  return {
    props: {
      messages: JSON.stringify(messages),
      chat,
    },
  };
};
