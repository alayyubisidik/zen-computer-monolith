import AccountLayout from "@/components/AccountLayout";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    phone_number: number;
    date_of_birth: string;
    gender: string;
    image: string;
    created_at: string;
    updated_at: string;
}

interface ProfileProps {
    user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [fullname, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState(0);
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [image, setImage] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name);
            setEmail(user.email);
            setPhoneNumber(user.phone_number);
            setGender(user.gender);
            setDateOfBirth(user.date_of_birth.split("T")[0]);
            setImage(user.image);
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; 
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file); 
        }
    };
    

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        var enteredFile
        if (fileInputRef.current?.files) {
            enteredFile = fileInputRef.current.files[0];
        }

        const formData = new FormData();
        formData.append("full_name", fullname);
        formData.append("email", email);
        formData.append("phone_number", String(phoneNumber));
        formData.append("date_of_birth", new Date(dateOfBirth).toISOString());
        formData.append("gender", gender);

        if (enteredFile) {
            formData.append("image", enteredFile);
        }

        try {
            await axios.put(`/api/v1/auth/${user.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            window.location.reload();
        } catch (error: any) {
            setErrors(
                error.response.data.errors || [
                    { message: "Something went wrong!" },
                ]
            );
        }

        setLoading(false);
    }
    return (
        <AccountLayout>
            <div className="border-b-2 border-blue-700">
                <h1 className="text-xl text-white font-semibold">My Profile</h1>
                <p className="text-sm mb-1 text-white">
                    Manage your profile information to control, protect and
                    secure your account.
                </p>
            </div>

            {errors.length > 0 && (
                <div
                    className="p-4 mb-4 text-sm text-red-700 rounded-lg bg-red-300"
                    role="alert"
                >
                    <ul>
                        {/* {errors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                        ))} */}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className=" flex flex-col-reverse justify-center items-center lg:justify-normal lg:flex lg:flex-row gap-[2rem] mt-[3rem]">
                    <div className="w-[100%] lg:w-[60%]">
                        <div className="mb-3">
                            <label
                                htmlFor="full_name"
                                className="block mb-2 text-sm font-medium text-white "
                            >
                                Full Name
                            </label>
                            <input
                                value={fullname}
                                onChange={(e) => setFullName(e.target.value)}
                                type="text"
                                id="full_name"
                                className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-white "
                            >
                                Email
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                id="email"
                                className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="phone_number"
                                className="block mb-2 text-sm font-medium text-white "
                            >
                                Phone Number
                            </label>
                            <input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(Number(e.target.value))}
                                type="number"
                                id="phone_number"
                                className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="date_of_birth"
                                className="block mb-2 text-sm font-medium text-white "
                            >
                                Date Of Birth
                            </label>
                            <input
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                type="date"
                                id="date_of_birth"
                                className=" bg-white border border-blue-700 text-black text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                            />
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="gender"
                                className="block mb-2 text-sm font-medium text-white "
                            >
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                id="gender"
                                className="bg-gray-950 border border-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                            >
                                <option value="laki-laki">Male</option>
                                <option value="perempuan">Female</option>
                            </select>
                        </div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="shadow-[0_0_10px_0_rgba(0,0,0,0.9)] shadow-blue-700 focus:outline-none text-white  hover:shadow-red-500 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-3 "
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                    <div className="w-[40%] flex flex-col justify-center items-center lg:border-l-2 lg:border-blue-700">
                        <div className="h-[13rem] w-[13rem]">
                            <img
                                className="rounded-full w-[100%] h-[100%]"
                                src={image}
                                alt="Profile"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleButtonClick}
                            className="shadow-[0_0_10px_0_rgba(0,0,0,0.9)] border-none shadow-blue-700 hover:shadow-red-500 py-2.5 px-5 mt-[1rem] mb-[.5rem] text-sm font-medium text-white focus:outline-none  rounded-lg border  focus:z-10 focus:ring-4 "
                        >
                            Change Image
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            name="image  "
                            onChange={handleImageChange}
                        />
                        <div className="text-center">
                            <p className="text-sm text-white">
                                Image Size: max. 1 MB
                            </p>
                            <p className="text-sm text-white">
                                Image Format: .JPG, .JPEG, .PNG
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </AccountLayout>

    );
};

export default Profile

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const session = await getSession({ req: context.req });

    const user =  {
        id: session?.user.id,
        role: session?.user.role,
    }
    const { data } = await axios.get("http://localhost:8000/api/v1/auth/currentuser", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${JSON.stringify(user)}`
        }
    });
    
    if (data.data) {
        return {
            props: {
                user: data.data,
            },
        };
    }

    return {
        props: {
            user: null,
        },
    };
};