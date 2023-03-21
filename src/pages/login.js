import { Button } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import Head from "next/head";
import React from "react";
import { auth, provider } from "../../firebase";

const Login = () => {
  const signIn = () => {
    signInWithPopup(auth, provider).catch(alert);
  };

  return (
    <div className="grid place-items-center h-screen bg-gray-100">
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex flex-col p-24 items-center bg-white rounded-md shadow-xl">
        <h1 className="mb-4 text-xl font-semibold">NgobrolApp</h1>
        <Button variant="outlined" onClick={signIn}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;
