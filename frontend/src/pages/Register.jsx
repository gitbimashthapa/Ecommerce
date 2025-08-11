import React, { useState } from 'react'
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';

const Register = () => {
    //hook 
    //usestate
    const navigate=useNavigate();

    const [userData, setUserData]=useState({
        username:"",
        email:"",
        password:""
    })

    const handleChange=(e)=>{
        const{name, value}=e.target;
        setUserData({
            ...userData,
            [name]:value
        })
    }
    
    const handleSubmit= async(e)=>{
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/api/register", userData);
            console.log("Data in the response : ", response.data);
            toast.success("User successfully registered");
            navigate("/login");
        } catch (err) {
            console.error("Registration error:", err);
            toast.error("Registration failed. Please try again.");
        }
    }

    return (
        <div>
            <Navbar />
            <section className="bg-blue-50 min-h-screen">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Create an account
                            </h1>
                           <form className="space-y-4 md:space-y-6" action="#" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">Username</label>
                                    <input type="username" onChange={handleChange} name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5" placeholder="Enter your username" required=""/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                                    <input type="email" onChange={handleChange} name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5" placeholder="name@company.com" required=""/>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                                    <input type="password" onChange={handleChange} name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5" required=""/>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-teal-300" required=""/>
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="font-light text-gray-500">I accept the <a className="font-medium text-teal-600 hover:underline" href="#">Terms and Conditions</a></label>
                                    </div>
                                </div>
                                <button type="submit" className="w-full text-white bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Create an account</button>
                                <p className="text-sm font-light text-gray-500">
                                    Already have an account? <Link to="/login" className="font-medium text-teal-600 hover:underline">Login here</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Register