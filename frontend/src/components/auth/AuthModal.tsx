import {
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: "login" | "signup";
  changeMode: (_: "login" | "signup") => void;
}

export function AuthModal({
  open,
  onClose,
  mode: currentMode,
  changeMode,
}: AuthModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="auth-modal-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ModalDialog>
        <DialogTitle>Pleas sign up to continue</DialogTitle>
        <Divider />
        <DialogContent>
          {currentMode === "login" ? (
            <>
              <LoginForm onSuccess={onClose} />
              <Typography level="body-sm" textAlign="center">
                New user?{" "}
                <Link component="button" onClick={() => changeMode("signup")}>
                  Signup
                </Link>
              </Typography>
            </>
          ) : (
            <>
              <SignupForm onSuccess={onClose} />
              <Typography level="body-sm" textAlign="center">
                Already registered?{" "}
                <Link component="button" onClick={() => changeMode("login")}>
                  Login
                </Link>
              </Typography>
            </>
          )}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
