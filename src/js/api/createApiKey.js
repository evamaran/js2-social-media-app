import { getToken, saveApiKey } from "../utils/storage.js";

export async function createApiKey() {
	const token = getToken();

	if (!token) {
		throw new Error("Missing access token. Please log in first.");
	}

	const response = await fetch("https://v2.api.noroff.dev/auth/create-api-key", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.errors?.[0]?.message || "Failed to create API key");
	}

	const apiKey = data.data.key;
	saveApiKey(apiKey);

	return apiKey;
}
