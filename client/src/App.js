import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "./style/css/app.css";
import "./style/css/normalize.css";
import logo from "./style/assets/whitespotify.png";

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const signUp = () => loginWithRedirect({ screen_hint: "signup" });

  return (
    <div className="app">
      <div class="applogo">
        <img className="logo" alt="logo" src={logo} />
        <h1>rankify</h1>
      </div>
      <div>
        {!isAuthenticated ? (
          <button className="btn-primary" onClick={loginWithRedirect}>
            Login
          </button>
        ) : (
          <button className="btn-primary" onClick={() => navigate("/app")}>
            Enter App
          </button>
        )}
      </div>
      <div>
        <button className="btn-secondary" onClick={signUp}>
          Create Account
        </button>
      </div>
    </div>
  );
}

export default App;
