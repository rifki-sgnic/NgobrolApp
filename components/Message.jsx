import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const MessageElement = ({ children, type }) => {
  let className =
    "relative max-w-xs p-4 pb-6 m-3 break-words rounded-lg w-fit min-w-68";
  if (type === "Sender") {
    className = `${className} ml-auto bg-sky-300 rounded-br-none`;
  }
  if (type === "Receiver") {
    className = `${className} bg-gray-100 rounded-bl-none`;
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
        <span className="absolute bottom-0 right-0 p-2 text-xs font-light text-right text-gray-800">
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
