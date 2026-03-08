import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@mui/joy";
import { useRegister } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

interface SignupFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

const signupSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .required("Username is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync: register } = useRegister();
  const navigate = useNavigate();

  const initialValues: SignupFormValues = {
    username: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: SignupFormValues) => {
    await register(values, {
      onSuccess: () => {
        onSuccess?.();
        navigate({ to: "/feed" });
      },
    });
  };

  return (
    <Box>
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Username</FormLabel>
              <Field
                as={Input}
                name="username"
                type="text"
                placeholder="Choose a username"
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

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Password</FormLabel>
              <Field
                as={Input}
                name="password"
                type="password"
                placeholder="Create a password"
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

            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Confirm Password</FormLabel>
              <Field
                as={Input}
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                error={
                  touched.confirmPassword && Boolean(errors.confirmPassword)
                }
              />
              <ErrorMessage name="confirmPassword">
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
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
