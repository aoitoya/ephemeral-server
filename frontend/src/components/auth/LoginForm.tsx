import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
} from "@mui/joy";
import { useLogin } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

interface LoginFormValues {
  username: string;
  password: string;
}

const loginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

interface ErrorResponse {
  message?: string;
}

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync: login } = useLogin();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const initialValues: LoginFormValues = {
    username: "",
    password: "",
  };

  const handleSubmit = async (values: LoginFormValues) => {
    setLoginError(null);
    await login(values, {
      onSuccess: () => {
        onSuccess?.();
        navigate({ to: "/feed" });
      },
      onError: (error) => {
        const err = error as { response?: { data?: ErrorResponse } };
        const message = err.response?.data?.message || "Login failed";
        setLoginError(message);
      },
    });
  };

  return (
    <Box>
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            {loginError && (
              <Alert color="danger" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Username</FormLabel>
              <Field
                as={Input}
                name="username"
                placeholder="Enter your username"
                error={touched.username && Boolean(errors.username)}
              />
              <ErrorMessage name="username">
                {(msg) => (
                  <Typography
                    sx={{ color: "danger.500", fontSize: "0.8rem", mt: 0.5 }}
                  >
                    {msg}
                  </Typography>
                )}
              </ErrorMessage>
            </FormControl>

            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Password</FormLabel>
              <Field
                as={Input}
                name="password"
                type="password"
                placeholder="Enter your password"
                error={touched.password && Boolean(errors.password)}
              />
              <ErrorMessage name="password">
                {(msg) => (
                  <Typography
                    sx={{ color: "danger.500", fontSize: "0.8rem", mt: 0.5 }}
                  >
                    {msg}
                  </Typography>
                )}
              </ErrorMessage>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              sx={{
                bgcolor: "primary.solidBg",
                borderRadius: "md",
                "&:hover": {
                  bgcolor: "primary.solidHoverBg",
                },
                mb: 2,
              }}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default LoginForm;
