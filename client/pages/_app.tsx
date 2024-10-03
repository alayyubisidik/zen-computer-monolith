import "@/styles/globals.css";
import { getSession, SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Session {
  user: {
    id: number;
    full_name: string;
    email: string;
    image: string;
    role: string;
  };
  expires: string;
}

interface MyAppProps extends AppProps {
  session: Session; 
}

const disabledNavbarAndFooter = ["/auth/signin", "/auth/signup"];

function MyApp({ Component, pageProps, session }: MyAppProps) {
  const pathname = usePathname();

  return (
    <SessionProvider session={session}>
      {!disabledNavbarAndFooter.includes(pathname) && <Navbar currentUser={session?.user} />}
      <Component {...pageProps} currentUser={session?.user} />
      {!disabledNavbarAndFooter.includes(pathname) && <Footer />}
    </SessionProvider>
  );
}

MyApp.getInitialProps = async ({ ctx }: any) => {
  const session = await getSession({ req: ctx.req });

  return {
      session,
  };
};

export default MyApp;
