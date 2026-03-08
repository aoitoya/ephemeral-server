import axios from "axios";
import Cookies from "js-cookie";

export const API_V1 = `/api/v1`;

export const apiClient = axios.create({
	baseURL: API_V1,
	withCredentials: true,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.request.use((config) => {
	const csrf = Cookies.get("XSRF-TOKEN");

	if (csrf) {
		config.headers["x-xsrf-token"] = csrf;
	}
	return config;
});

apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if ([401, 403].includes(error.response?.status)) {
			window.dispatchEvent(new CustomEvent("auth:unauthorized"));
		}
		return Promise.reject(error);
	},
);
