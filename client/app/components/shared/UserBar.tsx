import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import Settings from "./Settings";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME!);

  if (!token) redirect("/login");

  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Cookie: `${process.env.COOKIE_NAME}=${token.value}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) redirect("/login");
    throw new Error("Failed to fetch current user");
  }

  const json = (await response.json()) as { data: CurrentUser };
  return json.data;
}

const UserBar = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{user.username}</span>
      </p>
      <Settings isUserAvailable={!!user.username} user={user} />
      <LogoutButton />
    </div>
  );
};

export default UserBar;
