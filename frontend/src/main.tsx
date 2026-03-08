import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import "./styles/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a new query client instance
const queryClient = new QueryClient();

// Create the router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Create a theme instance
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: "#f0f4ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#667eea",
          600: "#5a67d8",
          700: "#4c51bf",
          800: "#434190",
          900: "#3c366b",
          solidBg: "#667eea",
          solidHoverBg: "#5a67d8",
          solidActiveBg: "#4c51bf",
        },
        neutral: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
        background: {
          body: "#ffffff",
          surface: "#ffffff",
          level1: "#f8f9fa",
          level3: "#e5e7eb",
        },
        text: {
          primary: "#1f2937",
          secondary: "#6b7280",
          tertiary: "#9ca3af",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: "#f0f4ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#667eea",
          600: "#5a67d8",
          700: "#4c51bf",
          800: "#434190",
          900: "#3c366b",
          solidBg: "#667eea",
          solidHoverBg: "#5a67d8",
          solidActiveBg: "#4c51bf",
        },
        background: {
          body: "#0f0f0f",
          surface: "#1a1a1a",
          level1: "#262626",
          level2: "#404040",
          level3: "#525252",
        },
        text: {
          primary: "#ffffff",
          secondary: "#d1d5db",
          tertiary: "#9ca3af",
        },
      },
    },
  },
  fontFamily: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    display:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    xl2: "1.5rem",
    xl3: "1.875rem",
    // "4xl": "2.25rem",
    // "5xl": "3rem",
    // "6xl": "3.75rem",
    // "7xl": "4.5rem",
    // "8xl": "6rem",
    // "9xl": "8rem",
  },
  // borderRadius: {
  //   sm: "0.25rem",
  //   md: "0.375rem",
  //   lg: "0.5rem",
  //   xl: "0.75rem",
  //   "2xl": "1rem",
  //   "3xl": "1.5rem",
  //   "4xl": "2rem",
  // },
  shadow: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
});

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <CssVarsProvider theme={theme} defaultMode="light">
          <CssBaseline />
          <RouterProvider router={router} />
        </CssVarsProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
