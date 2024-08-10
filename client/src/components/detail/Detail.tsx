import { apiBaseUrl } from "../../lib/apiRequest";
import { useChatStore } from "../../store/chatStore";
import { useWindowStore } from "../../store/windowStore";
import "./detail.css";

const Detail = () => {
  const { user } = useChatStore();

  const { isMobile, toggleList, toggleChat, toggleInfo, toggleDetail } =
    useWindowStore();

  const handleClose = () => {
    if (isMobile) {
      toggleList(false);
      toggleChat(true);
    } else {
      toggleChat(true);
    }
    toggleInfo(false);
    toggleDetail(false);
  };

  if (!user) {
    return;
  }

  return (
    <div className="detail">
      <div className="close">
        <img src="/svg/close.svg" alt="" onClick={handleClose} />
      </div>
      <div className="user">
        <img
          src={user?.avatar ? `${apiBaseUrl}/${user?.avatar}` : "/svg/user.svg"}
          alt=""
        />
        <h2>{user?.username}</h2>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Email:</span>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
