import { Box } from "@mui/joy";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Sidebar from "@/components/layout/Sidebar";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import { SocketProvider } from "@/hooks/useSocket";
import { isLoggedIn } from "@/services/utils";

export const Route = createFileRoute("/_app")({
	beforeLoad: (p) => {
		if (isLoggedIn()) {
			return;
		}

		if (p.location.pathname !== "/feed") {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	// useSocketEvent("notify:new-connection-req", (_p: unknown) => {
	//   console.log(_p);
	// });

	return (
		<Box
			sx={{
				display: "flex",
				minHeight: "100vh",
				backgroundColor: "background.body",
			}}
		>
			<Sidebar />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					backgroundColor: "#fafafa",
					height: "100vh",
					overflowY: "auto",
				}}
			>
				<SocketProvider>
					<AuthModalProvider>
						<Outlet />
					</AuthModalProvider>
				</SocketProvider>
			</Box>
		</Box>
	);
}
