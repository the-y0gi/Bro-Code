import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserProvider, useUserContext } from "./context/UserContext";
import { SocketProvider } from "./context/SocketContext";
import AppRouter from "./routes/AppRouter";

const AppWithSocket = () => {
  const { data: currentUser } = useUserContext();

  return (
    <SocketProvider userId={currentUser?.user?._id}>
      <AppRouter />
      <ToastContainer position="top-center" autoClose={1000} />
    </SocketProvider>
  );
};

function App() {
  return (
    <UserProvider>
      <AppWithSocket />
    </UserProvider>
  );
}

export default App;

