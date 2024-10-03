import { signOut } from "next-auth/react";

interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  image: string;
  role: string;
}

interface HomeProps {
  currentUser: CurrentUser;
}

export default function Home({ currentUser }: HomeProps) {
  return (
    <div>
      <h1>Home</h1>
      {currentUser ? <p>Welcome, {currentUser.email}</p> : <p>You are not logged in</p>}
      {currentUser && (
        <button className="text-white bg-red-500" onClick={() => signOut()}>Logout</button>
      )}
    </div>
  );
}
