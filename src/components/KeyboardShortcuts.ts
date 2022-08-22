import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import hotkeys from "hotkeys-js";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  const handleSignout = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        isOnline: false,
      });
      await signOut(auth);
      navigate("/login");
    }
  };

  hotkeys("alt+p,alt+h,alt+l", function (event, handler) {
    console.log(event);
    event.preventDefault();
    switch (handler.key) {
      case "alt+p":
        navigate("/profile");
        break;
      case "alt+h":
        navigate("/");
        break;
      case "alt+l":
        handleSignout();
        break;
      default:
        alert(event);
    }
  });
};

export default KeyboardShortcuts;
