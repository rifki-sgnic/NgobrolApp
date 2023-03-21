import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const MessageElement = ({ children, type }) => {
  let className = "w-fit p-4 rounded-lg m-3 min-w-64 pb-6 relative text-right";
  if (type === "Sender") {
    className = `${className} ml-auto bg-sky-300`;
  }
  if (type === "Receiver") {
    className = `${className} text-left bg-gray-100`;
  }
  return <p className={className}>{children}</p>;
};

const Message = ({ user, message }) => {
  const [userLoggedIn] = useAuthState(auth);

  const TypeOfMessage = user === userLoggedIn.email ? "Sender" : "Receiver";

  return (
    <div>
      <MessageElement type={TypeOfMessage}>
        {message.message}
        <span className="text-gray-800 p-2 font-light text-xs absolute bottom-0 right-0 text-right">
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString("id-ID", {
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
              })
            : "..."}
        </span>
      </MessageElement>
    </div>
  );
};

export default Message;
