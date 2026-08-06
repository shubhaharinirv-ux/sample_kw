import { ReactNode } from "react";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { BoardsProvider } from "@/features/boards/context/BoardsContext";
import { ToastContainer } from "react-toastify";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <BoardsProvider>
        {children}
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar
          newestOnTop
          closeOnClick={false}
          pauseOnHover
          theme="light"
          toastClassName="kalai-toast"
          bodyClassName="kalai-toast__body"
        />
      </BoardsProvider>
    </ReactQueryProvider>
  );
}
