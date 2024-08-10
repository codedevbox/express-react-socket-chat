import { ChangeEvent, FormEvent, useState } from "react";
import { useWindowStore } from "../../store/windowStore";
import "./info.css";
import { toast } from "react-toastify";
import { AvatarState } from "../../types";
import { useUserStore } from "../../store/userStore";
import { apiBaseUrl } from "../../lib/apiRequest";

const Info = () => {
  const [avatar, setAvatar] = useState<AvatarState>({ file: null, url: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile, toggleList, toggleChat, toggleInfo, toggleDetail } =
    useWindowStore();
  const { currentUser, update } = useUserStore();

  const handleClose = () => {
    if (isMobile) {
      toggleList(true);
      toggleChat(false);
    } else {
      toggleChat(true);
    }
    toggleInfo(false);
    toggleDetail(false);
  };

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAvatar({
        file: file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const username = formData.get("username")?.toString() || "";
      const email = formData.get("email")?.toString() || "";

      if (!username.trim() || !email.trim()) {
        toast.error("Username, email and password are required.");
        setIsLoading(false);
        return;
      }

      if (avatar.file) {
        formData.append("avatar", avatar.file);
      }

      const { success, message } = await update(formData);
      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to create an account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="editInfo">
      <form onSubmit={handleUpdate}>
        <div className="close">
          <img src="/svg/close.svg" alt="" onClick={handleClose} />
        </div>
        <div className="user">
          <label htmlFor="file">
            <img
              src={
                avatar.url ||
                (currentUser?.avatar
                  ? `${apiBaseUrl}/${currentUser?.avatar}`
                  : "/svg/user.svg")
              }
              alt=""
            />
            <span>Change an image</span>
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
        </div>

        <div className="info">
          <div className="option">
            <div className="title">
              <span>UserName</span>
              <input
                type="text"
                placeholder="Username"
                name="username"
                defaultValue={currentUser?.username}
              />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Email</span>
              <input
                type="text"
                placeholder="Email"
                name="email"
                defaultValue={currentUser?.email}
              />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Password</span>
              <input type="password" placeholder="Password" name="password" />
            </div>
          </div>
        </div>
        <div className="controls">
          <button disabled={isLoading}>Save</button>
        </div>
      </form>
    </div>
  );
};

export default Info;
