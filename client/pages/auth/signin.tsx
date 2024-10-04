// pages/auth/login.tsx
import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

export default function SignIn() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)

        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.ok) {
            router.push("/");
            setLoading(false)
        } else if (res?.error) {
            setError("Invalid credentials")
        }
    };

    return (
        <section className="bg-black">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <Link href="/" className="flex items-center mb-6 text-2xl  text-red-500 italic font-bold">
                    Zen<span className='text-blue-700 '>Computer</span>
                </Link>

                <div className="w-full shadow-[0_0_10px_0_rgba(0,0,0,0.9)] shadow-red-500 rounded-lg md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                            Sign in to your account
                        </h1>
                        {error && <p className='text text-center text-red-500'>{error}</p>}
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                                    Your Email
                                </label>
                                <input type="text" name="email" id="email" className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="jhon doe" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                                    Password
                                </label>
                                <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5" />
                            </div>
                            <button
                                disabled={loading}
                                type="submit"
                                className={`w-full text-white ${loading ? "bg-blue-500" : "bg-blue-700"
                                    } hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>
                        <p className="text-white text-center font-semibold">Or</p>
                        <button type="button" onClick={() => signIn("google")} className="w-[100%] flex justify-center items-center text-center text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-[#4285F4]/55 ">
                            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                                <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd" />
                            </svg>
                            Sign in with Google
                        </button>
                        <p className="text-sm font-light text-white">
                            Don’t have an account yet? <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
