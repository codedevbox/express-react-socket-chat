import { useEffect, useState } from "react";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useUserStore } from "./store/userStore";
import { useChatStore } from "./store/chatStore";
import Info from "./components/info/Info";
import { useWindowStore } from "./store/windowStore";
import Detail from "./components/detail/Detail";
import useWindowSize from "./hooks/useWindowSize";

function App() {
  const { currentUser, checkAuth } = useUserStore();
  const { chatId } = useChatStore();
  const {
    showList,
    showChat,
    showInfo,
    showDetail,
    updateIsMobile,
    toggleList,
    toggleChat,
    toggleInfo,
    toggleDetail,
  } = useWindowStore();
  const [width] = useWindowSize();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      setIsLoading(true);
      await checkAuth();
      setIsLoading(false);
    };
    authenticate();
  }, [checkAuth]);

  useEffect(() => {
    const isMobileNow = width < import.meta.env.VITE_MOBILE_SCREEN;
    updateIsMobile(isMobileNow);
    if (isMobileNow) {
      toggleChat(false);
      toggleInfo(false);
      toggleDetail(false);
      toggleList(true);
    } else {
      toggleChat(true);
      toggleList(true);
    }
  }, [width, updateIsMobile, toggleChat, toggleInfo, toggleDetail, toggleList]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      {!currentUser ? (
        <Login />
      ) : (
        <>
          {showList && <List />}
          {showChat &&
            (chatId ? (
              <Chat />
            ) : (
              <div className="information">Select user to start chatting!</div>
            ))}
          {showInfo && <Info />}
          {showDetail && <Detail />}
        </>
      )}
      <Notification />
    </div>
  );
}

export default App;
