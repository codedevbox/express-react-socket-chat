import { ChangeEvent, useState, FormEvent, useRef } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/userStore";
import { useWindowStore } from "../../store/windowStore";
import { AvatarState } from "../../types";

const Login = () => {
  const [avatar, setAvatar] = useState<AvatarState>({ file: null, url: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useUserStore();
  const [currentForm, setCurrentForm] = useState("login"); // 'login', 'register'
  const { isMobile } = useWindowStore();

  const formRegisterRef = useRef<HTMLFormElement>(null);

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAvatar({
        file: file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const username = formData.get("username")?.toString() || "";
      const password = formData.get("password")?.toString() || "";
      const email = formData.get("email")?.toString() || "";

      if (!username.trim() || !password.trim() || !email.trim()) {
        toast.error("Username, email and password are required.");
        setIsLoading(false);
        return;
      }

      if (avatar.file) {
        formData.append("avatar", avatar.file);
      }

      const { success, message } = await register(formData);
      if (success) {
        toast.success(message);
        if (formRegisterRef.current) {
          formRegisterRef.current.reset();
        }
        setAvatar({ file: null, url: "" });
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to create an account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const username = formData.get("username")?.toString() || "";
      const password = formData.get("password")?.toString() || "";

      if (!username.trim() || !password.trim()) {
        toast.error("Username and password are required.");
        setIsLoading(false);
        return;
      }

      const { success, message } = await login(username, password);
      if (!success) {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      {(!isMobile || currentForm === "login") && (
        <div className="item">
          <h2>Welcome, back</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Login" name="username" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={isLoading}>Sign in</button>
          </form>
          {isMobile && (
            <button
              className="likelink"
              onClick={() => setCurrentForm("register")}
            >
              Need to register?
            </button>
          )}
        </div>
      )}
      {!isMobile && <div className="separator"></div>}
      {(!isMobile || currentForm === "register") && (
        <div className="item">
          <h2>Create an accaunt</h2>
          <form onSubmit={handleRegister} ref={formRegisterRef}>
            <label htmlFor="file">
              <img src={avatar.url || "/svg/user.svg"} alt="" />
              Upload an image
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleAvatar}
            />
            <input type="text" placeholder="Username" name="username" />
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={isLoading}>Sign Up</button>
          </form>
          {isMobile && (
            <button
              className="likelink"
              onClick={() => setCurrentForm("login")}
            >
              Go to Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
