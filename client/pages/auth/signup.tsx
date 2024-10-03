import React, { useRef, useState } from 'react'
import Router from 'next/router';
import { getSession, signIn } from 'next-auth/react';
import Link from "next/link";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

interface ErrorType {
    [key: string]: string; // Setiap field akan memiliki pesan error
}

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ErrorType>({});
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [gender, setGender] = useState("male")
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("email", e.currentTarget.email.value);
        formData.append("password", e.currentTarget.password.value);
        formData.append("full_name", e.currentTarget.full_name.value);
        formData.append("phone_number", e.currentTarget.phone_number.value);
        if (dateOfBirth) {
            formData.append("date_of_birth", new Date(dateOfBirth).toISOString());
        }
        formData.append("gender", gender);

        if (fileInputRef.current && fileInputRef.current.files![0]) {
            formData.append("profile_picture", fileInputRef.current.files![0]);
        } else {
            console.log("No file selected or ref is null.");
        }

        const email = e.currentTarget.email.value
        const password = e.currentTarget.password.value

        try {
            await axios.post("http://localhost:8000/api/v1/auth/signup", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (res?.ok) {
                Router.push("/")
            } else {
                console.log("something wrong")
            }


        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const newErrors: ErrorType = {};

                error.response?.data.errors.forEach((err: { field: string; message: string }) => {
                    newErrors[err.field] = err.message;
                });

                setErrors(newErrors); // Set the parsed errors to the state
            } else {
                setErrors({ global: "An unexpected error occurred." }); // Global error for unknown errors
            }
        }

        setLoading(false);
    }

    return (
        <section className="bg-black">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <Link href="/" className="flex items-center mb-6 text-2xl  text-red-500 italic font-bold">
                    Zen<span className='text-blue-700 '>Computer</span>
                </Link>

                <div className="w-full shadow-[0_0_10px_0_rgba(0,0,0,0.9)] shadow-red-500 rounded-lg md:mt-0 sm:max-w-3xl xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                            Create your account
                        </h1>
                        <form
                            className="space-y-4 md:space-y-6"
                            onSubmit={submitHandler}
                        >
                            <div className="flex gap-5">
                                <div className="w-[50%]">
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className=" mt-2 block mb-1 text-sm font-medium text-white"
                                        >
                                            Your email
                                        </label>
                                        {errors.Email && <p className='text-sm text-red-500 mb-1'>{errors.Email}</p>}
                                        <input
                                            name="email"
                                            id="email"
                                            className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                            placeholder="name@company.com"

                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className=" mt-2 block mb-1 text-sm font-medium text-white"
                                        >
                                            Password
                                        </label>
                                        {errors.Password && <p className='text-sm text-red-500 mb-1'>{errors.Password}</p>}
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            placeholder="••••••••"
                                            className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"

                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="full_name"
                                            className=" mt-2 block mb-1 text-sm font-medium text-white"
                                        >
                                            Full Name
                                        </label>
                                        {errors.FullName && <p className='text-sm text-red-500 mb-1'>{errors.FullName}</p>}
                                        <input
                                            type="text"
                                            name="full_name"
                                            id="full_name"
                                            placeholder="Jhon Doe"
                                            className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"

                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="phone_number"
                                            className=" mt-2 block mb-1 text-sm font-medium text-white"
                                        >
                                            Phone Number
                                        </label>
                                        {errors.PhoneNumber && <p className='text-sm text-red-500 mb-1'>{errors.PhoneNumber}</p>}
                                        <input
                                            type="number"
                                            name="phone_number"
                                            id="phone_number"
                                            placeholder="0898693432432"
                                            className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"

                                        />
                                    </div>
                                </div>
                                <div className="w-[50%]">
                                    <div>
                                        <label
                                            htmlFor="date_of_birth"
                                            className=" mt-2 block mb-1 text-sm font-medium text-white"
                                        >
                                            Date Of Birth
                                        </label>
                                        {errors.DateOfBirth && <p className='text-sm text-red-500 mb-1'>{errors.DateOfBirth}</p>}
                                        <input
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            type="date"
                                            name="date_of_birth"
                                            id="date_of_birth"
                                            className="bg-white border border-blue-700 text-black text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"

                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="gender"
                                            className=" mt-2 block mb-1 text-sm font-medium text-white"
                                        >
                                            Gender
                                        </label>
                                        {errors.Gender && <p className='text-sm text-red-500 mb-1'>{errors.Gender}</p>}
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            id="gender"
                                            name="gender"
                                            className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"

                                        >
                                            <option value="male">
                                                Male
                                            </option>
                                            <option value="female">
                                                Female
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            className="block mb-1 mt-2 text-sm font-medium text-white "
                                            htmlFor="file_input"
                                        >
                                            Upload Profile Picture
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                            id="file_input"
                                            type="file"
                                            name="profile_picture"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className={`w-full text-white ${loading ? "bg-blue-500" : "bg-blue-700"
                                    } hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                            >
                                {loading ? "Signing up..." : "Sign up"}
                            </button>
                        </form>
                        <p className="text-white text-center font-semibold">Or</p>
                        <button type="button" onClick={() => signIn("google")} className="w-[100%] flex justify-center items-center text-center text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-[#4285F4]/55 ">
                            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                                <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd" />
                            </svg>
                            Sign up with Google
                        </button>
                        <p className="text-sm font-light text-white">
                            Already have an account?{" "}
                            <Link
                                href="/auth/signin"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const session = await getSession({ req: context.req });

    if (session) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        };
    }

    return {
        props: {
            session: session || null
        }
    };
};


export default SignUp