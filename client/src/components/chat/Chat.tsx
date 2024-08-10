import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useUserStore } from "../../store/userStore";
import { useChatStore } from "../../store/chatStore";
import { ChatDetail, UserMessage } from "../../types";
import { apiBaseUrl, apiRequest } from "../../lib/apiRequest";
import { format } from "timeago.js";
import { toast } from "react-toastify";
import { SocketContext } from "../../context/SocketContext";
import { useWindowStore } from "../../store/windowStore";

interface EmojiEvent {
  emoji: string;
}

const Chat = () => {
  const [chat, setChat] = useState<ChatDetail>();
  const [isLoading, setIsLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { currentUser } = useUserStore();
  const { chatId, user } = useChatStore();
  const { socket } = useContext(SocketContext);
  const { isMobile, toggleList, toggleChat, toggleInfo, toggleDetail } =
    useWindowStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const getChat = async (chatId: string) => {
      setIsLoading(true);
      try {
        const response = await apiRequest.get(`/chats/${chatId}`);
        setChat(response.data || null);
      } catch (error) {
        setError("Failed to fetch chats!");
      } finally {
        setIsLoading(false);
      }
    };
    if (chatId) {
      getChat(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    const read = async () => {
      try {
        if (chat) {
          await apiRequest.put("/chats/read/" + chat.id);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data: UserMessage) => {
        if (chat.id === data.chatId) {
          setChat((prev) => {
            if (!prev) return;
            return { ...prev, messages: [...prev.messages, data] };
          });
          read();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("getMessage");
      }
    };
  }, [socket, chat]);

  const handleEmoji = (e: EmojiEvent) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSendLoading(true);

    const formData = new FormData(e.currentTarget);
    const text = formData.get("text")?.toString();
    if (!text) return;

    try {
      const res = await apiRequest.post(`/messages/${chatId}`, { text });
      if (res.status === 200 && res.data) {
        setChat((prev) => {
          if (!prev) {
            return;
          }
          return {
            ...prev,
            messages: [...prev.messages, res.data],
          };
        });
        setText("");
        formRef.current?.reset();
        socket?.emit("sendMessage", {
          receiverId: user?.id,
          data: res.data,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create a message.");
    } finally {
      setSendLoading(false);
    }
  };

  const handleBack = () => {
    if (isMobile) {
      toggleList(true);
      toggleChat(false);
    } else {
      toggleChat(true);
    }
    toggleInfo(false);
    toggleDetail(false);
  };

  const handleDetail = () => {
    if (isMobile) {
      toggleDetail(true);
      toggleList(false);
    } else {
      toggleDetail(true);
    }
    toggleInfo(false);
    toggleChat(false);
  };

  return (
    <div className="chat">
      {user && (
        <div className="top">
          <div className="back">
            <img src="/svg/left.svg" alt="" onClick={handleBack} />
          </div>
          <div className="user">
            <img
              src={
                user?.avatar ? `${apiBaseUrl}/${user?.avatar}` : "/svg/user.svg"
              }
              alt=""
            />
            <div className="text">
              <span>{user.username}</span>
            </div>
          </div>
          <div className="icons">
            <img src="/svg/info-circle.svg" alt="" onClick={handleDetail} />
          </div>
        </div>
      )}
      {isLoading ? (
        <div></div>
      ) : error ? (
        <div className="errorState">{error}</div>
      ) : (
        chat && (
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className={
                  message.userId === currentUser?.id ? "message own" : "message"
                }
                key={message.id}
              >
                {message.userId !== currentUser?.id && (
                  <img
                    src={
                      user?.avatar
                        ? `${apiBaseUrl}/${user?.avatar}`
                        : "/svg/user.svg"
                    }
                    alt=""
                  />
                )}
                <div className="text">
                  <p>{message.text}</p>
                  <span>{format(message.createdAt)}</span>
                </div>
              </div>
            ))}
            <div ref={endRef}></div>
          </div>
        )
      )}
      <form onSubmit={handleSubmit} className="bottom" ref={formRef}>
        <input
          type="text"
          name="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
        <div className="emoji">
          <img
            src="/svg/emoji.svg"
            alt=""
            onClick={() => setOpenEmoji((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" disabled={sendLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
