import { useUserStore } from "../../../store/userStore";
import { apiBaseUrl } from "../../../lib/apiRequest";
import "./userInfo.css";
import { useWindowStore } from "../../../store/windowStore";

const UserInfo = () => {
  const { currentUser, logout } = useUserStore();
  const { showInfo, isMobile, toggleList, toggleChat, toggleInfo } =
    useWindowStore();

  const handleLogout = async () => {
    await logout();
  };

  const handleInfo = async () => {
    if (isMobile) {
      toggleList(false);
      toggleChat(false);
      toggleInfo(true);
    } else {
      toggleChat(false);
      toggleInfo(true);
    }
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img
          src={
            currentUser?.avatar
              ? `${apiBaseUrl}/${currentUser?.avatar}`
              : "/svg/user.svg"
          }
          alt=""
        />
        <h2>{currentUser?.username}</h2>
      </div>
      <div className="icons">
        {!showInfo && <img src="/svg/edit.svg" alt="" onClick={handleInfo} />}
        <img src="/svg/logout.svg" alt="" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default UserInfo;
