import { FormEvent, useState } from "react";
import "./addUser.css";
import { toast } from "react-toastify";
import { apiBaseUrl, apiRequest } from "../../../../lib/apiRequest";
import { AxiosError } from "axios";
import { ErrorResponse, User } from "../../../../types";
import { useChatStore } from "../../../../store/chatStore";

const AddUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { changeChat, needRefreshChats } = useChatStore();

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setUser(null);
    try {
      const formData = new FormData(e.currentTarget);
      const username = formData.get("username")?.toString() || "";
      const response = await apiRequest.get(
        `/users/search?username=${username}`
      );
      if (response.data) {
        setUser(response.data);
      }
    } catch (error: unknown) {
      const typedError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        typedError.response?.data?.message || "Failed to search user!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      const newChat = await apiRequest.post(`/chats`, {
        receirverId: user?.id,
      });
      if (newChat && user) {
        needRefreshChats();
        changeChat(newChat.data.id, user);
      } else {
        toast.error("Failed to add user!");
      }
    } catch (error) {
      toast.error("Failed to add user!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button disabled={isLoading}>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="userdetail">
            <img
              src={
                user?.avatar ? `${apiBaseUrl}/${user?.avatar}` : "/svg/user.svg"
              }
              alt=""
            />
            <span>{user?.username}</span>
          </div>
          <button onClick={handleAdd} disabled={isLoading}>
            Add user
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
