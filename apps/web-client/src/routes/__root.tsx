// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: () => (
		<>
			<Outlet />
			{/* {import.meta.env.DEV && <TanStackRouterDevtools />} */}

			{/* <ReactQueryDevtools /> */}
		</>
	),
});

let a = "";
console.log(a);
