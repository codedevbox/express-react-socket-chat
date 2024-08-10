import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/apiRequest";
import AddUser from "./addUser/AddUser";
import ChatItem from "./сhatItem/ChatItem";
import { Chat } from "../../../types";
import "./chatList.css";
import { useChatStore } from "../../../store/chatStore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const { refreshChats, resetRefreshChats } = useChatStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getChats = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest.get("/chats");
        setChats(response.data || []);
      } catch (error) {
        setError("Failed to fetch chats!");
      } finally {
        setIsLoading(false);
        resetRefreshChats();
        setAddMode(false);
      }
    };
    getChats();
  }, [refreshChats, resetRefreshChats]);

  const filteredChats = chats.filter((c) =>
    c.receiver.username.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/svg/search.svg" alt="Search Icon" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
        <img
          src={addMode ? "/svg/minus.svg" : "/svg/plus.svg"}
          alt="Toggle Add"
          className={`add ${addMode ? "active" : ""}`}
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {isLoading ? (
        <div></div>
      ) : error ? (
        <div className="errorState">{error}</div>
      ) : (
        filteredChats.map((chat) => <ChatItem chat={chat} key={chat.id} />)
      )}
      {addMode && (
        <div className="overlay" onClick={() => setAddMode(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <AddUser />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
