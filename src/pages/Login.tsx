import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth, db, provider } from "../firebase";
import { updateDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { FcGoogle } from "react-icons/fc";

interface UserData {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

const Login = () => {
  const [data, setData] = useState<UserData>({
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const navigate = useNavigate();

  const { email, password, error, loading } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //const target = e.target as HTMLTextAreaElement;
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!email || !password) {
      setData({ ...data, error: "All fields are required" });
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log(result.user);
      await updateDoc(doc(db, "users", result.user.uid), {
        isOnline: true,
      });
      setData({
        email: "",
        password: "",
        error: null,
        loading: false,
      });
      navigate("/");
    } catch (err: any) {
      setData({ ...data, error: err.message, loading: false });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      if (
        result.user.metadata.creationTime ===
        result.user.metadata.lastSignInTime
      ) {
        console.log("set section executed");
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          isOnline: true,
          token: "",
        });
      } else {
        console.log("updated section executed");
        await updateDoc(doc(db, "users", result.user.uid), {
          isOnline: true,
        });
      }
      setData({
        ...data,
        error: null,
        loading: false,
      });
      navigate("/");
    } catch (err: any) {
      setData({ ...data, error: err.message, loading: false });
    }
  };

  return (
    <div
      style={{
        paddingLeft: "20px",
        paddingRight: "20px",
        // position: "relative",
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
      }}
    >
      <section>
        <h3>Log into your Account</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input_container">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              value={email}
              onChange={handleChange}
              // placeholder="Enter email..."
            />
          </div>
          <div className="input_container">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
            />
          </div>
          {error ? <p className="error">{error}</p> : null}
          <div className="btn_container">
            <button className="btn" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ marginRight: "10px" }}>Logging in</span>
                  <CircularProgress color="inherit" size={15} />
                </>
              ) : (
                "Login"
              )}
            </button>
            <div style={{ marginTop: "5px" }}>
              <Link className="gotoLink" to="/register">
                No account yet? Register now!
              </Link>
            </div>
          </div>
        </form>
        <div
          className="btn_container"
          style={{
            paddingLeft: "20px",
            paddingRight: "20px",
            marginTop: "25px",
            marginBottom: "15px",
          }}
        >
          <button className="btn" onClick={signInWithGoogle} disabled={loading}>
            <span style={{ marginRight: "10px" }}>Sign In with Google</span>
            <FcGoogle size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Login;
