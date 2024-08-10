import { useContext, useEffect, useState } from "react";
import { apiBaseUrl } from "../../../../lib/apiRequest";
import { useChatStore } from "../../../../store/chatStore";
import { Chat, UserMessage } from "../../../../types";
import "./chatItem.css";
import { SocketContext } from "../../../../context/SocketContext";
import { useUserStore } from "../../../../store/userStore";
import { useWindowStore } from "../../../../store/windowStore";

interface ChatItemProps {
  chat: Chat;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat }) => {
  const { chatId, changeChat } = useChatStore();
  const { socket } = useContext(SocketContext);
  const [lastMesssage, setLastMesssage] = useState(chat.lastMessage);
  const [unreaded, setUnreaded] = useState(false);
  const { currentUser } = useUserStore();
  const { isMobile, toggleList, toggleChat, toggleInfo, toggleDetail } =
    useWindowStore();

  useEffect(() => {
    if (
      currentUser &&
      !chat.seenBy.includes(currentUser.id) &&
      chat.lastMessage
    ) {
      setUnreaded(true);
    }
  }, [chat.seenBy, currentUser, chat.lastMessage]);

  useEffect(() => {
    const messageHandler = (data: UserMessage) => {
      if (chat.id === data.chatId) {
        setLastMesssage(data.text);
        if (chatId !== chat.id) {
          setUnreaded(true);
        }
      }
    };

    if (socket) {
      socket.on("updateLastMessage", messageHandler);
      socket.on("updateLastSendMessage", messageHandler);
    }

    return () => {
      if (socket) {
        socket.off("updateLastMessage", messageHandler);
        socket.off("updateLastSendMessage", messageHandler);
      }
    };
  }, [socket, chat.id, chatId, chat.lastMessage]);

  const handleSelect = async (chat: Chat) => {
    changeChat(chat.id, chat.receiver);
    setUnreaded(false);
    if (isMobile) {
      toggleList(false);
    }
    toggleInfo(false);
    toggleDetail(false);
    toggleChat(true);
  };

  return (
    <div
      className={chat.id === chatId ? "chatitem active" : "chatitem"}
      onClick={() => handleSelect(chat)}
    >
      <img
        src={
          chat?.receiver.avatar
            ? `${apiBaseUrl}/${chat.receiver.avatar}`
            : "/svg/user.svg"
        }
        alt={`${chat.receiver.username}'s avatar`}
      />
      <div className="text">
        <span>{chat.receiver.username}</span>
        <p>
          {lastMesssage
            ? lastMesssage.length > 20
              ? `${lastMesssage.substring(0, 20)}...`
              : lastMesssage
            : "No message"}
        </p>
      </div>
      {unreaded && (
        <div className="unreaded">
          <img src="/svg/newMessage.svg" alt="" />
        </div>
      )}
    </div>
  );
};

export default ChatItem;
