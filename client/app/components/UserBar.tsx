import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import LogoutButton from "./LogoutButton";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CurrentUser = {
  id: string;
  username: string;
  email: string;
};

async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.NEXT_PUBLIC_JWT_SECRET_KEY!);

  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Cookie: `${process.env.NEXT_PUBLIC_JWT_SECRET_KEY}=${token.value}`,
      Accept: "application/json",
    },
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
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
      <LogoutButton />
    </div>
  );
};

export default UserBar;
