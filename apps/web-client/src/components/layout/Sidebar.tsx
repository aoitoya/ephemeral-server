import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	ListItemButton,
	Modal,
	ModalDialog,
	Typography,
	useTheme,
} from "@mui/joy";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

interface NavItem {
	to: string;
	label: string;
	icon: React.ReactNode;
}

function NavLink({
	to,
	label,
	icon,
	isActive,
}: NavItem & { isActive: boolean }) {
	const theme = useTheme();

	return (
		<Link to={to} style={{ width: "100%", textDecoration: "none" }}>
			<ListItemButton
				variant={isActive ? "soft" : "plain"}
				color={isActive ? "primary" : "neutral"}
				sx={{
					borderRadius: "12px",
					py: 1.25,
					px: 2.5,
					"&:hover": {
						backgroundColor: theme.vars.palette.primary.softHoverBg,
					},
				}}
			>
				<Box component="span" sx={{ display: "inline-flex", mr: 1.5 }}>
					{icon}
				</Box>
				<Typography level="body-md" sx={{ fontWeight: isActive ? 600 : 400 }}>
					{label}
				</Typography>
			</ListItemButton>
		</Link>
	);
}

export default function Sidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const currentPath = location.pathname;
	const { data: user } = useCurrentUser();
	const logoutMutation = useLogout();
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const loggedIn = !!user;

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
			setIsLogoutModalOpen(false);
			navigate({ to: "/" });
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const navItems: NavItem[] = loggedIn
		? [
				{ to: "/feed", label: "Feed", icon: <HomeRoundedIcon /> },
				{
					to: "/messeges",
					label: "Messages",
					icon: <ChatBubbleOutlineRoundedIcon />,
				},
				{
					to: "/connections",
					label: "Connections",
					icon: <PeopleOutlineRoundedIcon />,
				},
			]
		: [{ to: "/feed", label: "Feed", icon: <HomeRoundedIcon /> }];

	return (
		<Box
			component="nav"
			sx={{
				width: 240,
				flexShrink: 0,
				p: 2,
				borderRight: "1px solid",
				borderColor: "divider",
				minHeight: "100vh",
				backgroundColor: "background.surface",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Box
				sx={{
					px: 2,
					mb: 3,
				}}
			>
				<Typography
					level="h4"
					component="h1"
					sx={{
						fontWeight: 700,
						color: "primary.plainColor",
						letterSpacing: "-0.5px",
					}}
				>
					Ephemeral
				</Typography>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
				{navItems.map((item) => (
					<NavLink key={item.to} {...item} isActive={currentPath === item.to} />
				))}
			</Box>

			{loggedIn && (
				<Box sx={{ mt: "auto", pt: 2 }}>
					<Divider sx={{ mb: 2 }} />

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							px: 2.5,
							mb: 2,
						}}
					>
						<Box
							sx={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								backgroundColor: "primary.softBg",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "primary.plainColor",
							}}
						>
							<PersonRoundedIcon sx={{ fontSize: "1.25rem" }} />
						</Box>
						<Typography
							level="body-md"
							sx={{
								fontWeight: 600,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{user.username}
						</Typography>
					</Box>

					<ListItemButton
						onClick={() => setIsLogoutModalOpen(true)}
						variant="plain"
						color="danger"
						sx={{
							borderRadius: "12px",
							py: 1.25,
							px: 2.5,
						}}
					>
						<Box component="span" sx={{ display: "inline-flex", mr: 1.5 }}>
							<LogoutRoundedIcon />
						</Box>
						<Typography level="body-md" sx={{ fontWeight: 500 }}>
							Logout
						</Typography>
					</ListItemButton>
				</Box>
			)}

			<Modal
				open={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
			>
				<ModalDialog variant="outlined" role="alertdialog">
					<DialogTitle>
						<LogoutRoundedIcon />
						Confirmation
					</DialogTitle>
					<Divider />
					<DialogContent>Are you sure you want to log out?</DialogContent>
					<DialogActions>
						<Button
							variant="solid"
							color="danger"
							onClick={handleLogout}
							loading={logoutMutation.isPending}
						>
							Log out
						</Button>
						<Button
							variant="plain"
							color="neutral"
							onClick={() => setIsLogoutModalOpen(false)}
						>
							Cancel
						</Button>
					</DialogActions>
				</ModalDialog>
			</Modal>
		</Box>
	);
}
