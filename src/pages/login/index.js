import "./style.css";
import LoginForm from "../../components/login/LoginForm";
import RegisterForm from "../../components/login/RegisterForm";
import { useState } from "react";

export default function Login(socket) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="login">
      <div className="login_wrapper">
        <LoginForm setVisible={setVisible} socket={socket}/>
        {visible && <RegisterForm setVisible={setVisible} />}
      </div>
    </div>
  );
}
