import "@/styles/globals.css";
import { StyledEngineProvider } from "@mui/material";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../../components/Loading";
import { auth, db } from "../../firebase";
import Login from "./login";

export default function App({ Component, pageProps }) {
  const [user, loading] = useAuthState(auth);

  const setUserToDB = async () => {
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        lastSeen: serverTimestamp(),
        photoURL: user.photoURL,
      },
      { merge: true }
    );
  };

  useEffect(() => {
    if (user) {
      setUserToDB();
    }
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <Login />;

  return (
    <StyledEngineProvider injectFirst>
      <Component {...pageProps} />
    </StyledEngineProvider>
  );
}
