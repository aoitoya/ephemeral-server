import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { AuthModal } from "@/components/auth/AuthModal";

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined,
);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "login",
  );

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      openAuthModal("login");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{ isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal }}
    >
      {children}
      <AuthModal
        open={isAuthModalOpen}
        onClose={closeAuthModal}
        mode={authModalMode}
        changeMode={openAuthModal}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
