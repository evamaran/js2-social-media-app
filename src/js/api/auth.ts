const BASE_URL = "https://api.noroff.dev/api/v2";

export async function registerUser(userData: {
	name: string;
	email: string;
	password: string;
}) {
	const response = await fetch(`${BASE_URL}/auth/register`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(userData),
	});

	const data = await response.json();

	if (!response.ok) {
	throw new Error(data.errors?.[0]?.message || "Registration failed");
	}

	return data;
}
