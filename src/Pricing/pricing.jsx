import React, { useState } from 'react';
import { FcInfo } from 'react-icons/fc';
import { motion } from 'framer-motion';
import Slideshow from './Slideshow';
import { fadeIn } from '../variants';


const Pricing = () => {
    const [isYearly, setIsYearly] = useState(false);

    const packages = [
        { name: 'Free', monthlyPrice: 0, yearlyPrice: 0, description: "Free plan with basic features.", green: "/img/green-dot.png" },
        { name: 'Basic', monthlyPrice: 15, yearlyPrice: 150, description: "Basic plan with essential features.", green: "/img/green-dot.png" },
        { name: 'Advanced', monthlyPrice: 39, yearlyPrice: 399, description: "Advanced plan with more features.", green: "/img/green-dot.png" },
        { name: 'Enterprise', monthlyPrice: 'Contact us', yearlyPrice: 'Contact us', description: "Enterprise plan with customized features.", green: "/img/green-dot.png" },
    ];

    return (
        <div className="pricing-page py-10 md:px-14 p-4 max-w-screen-2xl mx-auto" id="pricing">
            <div className="container">
                <Slideshow />
                <div className="text-center mt-10">
                    <h2 className="md:text-5xl text-2xl font-extrabold text-gray-900 mb-2">Here are all our plans</h2>
                    <p className="text-tertiary md:w-1/3 mx-auto">Choose the plan that best suits your needs.</p>
                    <div className="toggle-container mt-16">
                        <label htmlFor="toggle" className="inline-flex items-center cursor-pointer">
                            <span className="mr-8 text-2xl font-semibold">Monthly</span>
                            <div className={`toggle-switch w-14 h-6 transition duration-200 bg-gray-300 ease-in-out rounded-full ${isYearly ? 'bg-primary' : 'bg-gray-500'}`}>
                                <div className={`toggle-circle w-6 h-6 transition duration-200 ease-in-out rounded-full ${isYearly ? 'bg-primary transform translate-x-8' : 'bg-gray-500'}`}></div>
                            </div>
                            <span className="ml-8 text-2xl font-semibold">Yearly</span>
                        </label>
                        <input
                            type="checkbox"
                            id="toggle"
                            className="hidden"
                            checked={isYearly}
                            onChange={() => setIsYearly(!isYearly)}
                        />
                    </div>
                </div>
                <motion.div
                    variants={fadeIn("up", 0.3)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: false, amount: 0.2 }}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-10 mt-20 md:w-11/12 mx-auto">
                    {packages.map((pkg, index) => (
                        <div key={index} className="pricing-card border py-10 md:px-6 px-4 rounded-lg shadow-3xl">
                            <h3 className="plan-title text-3xl font-bold text-center text-[#010851]">{pkg.name}</h3>
                            <p className="plan-description text-tertiary text-center my-6">{pkg.description}</p>
                            <p className="plan-price mt-5 text-center text-secondary text-4xl font-bold">
                                {isYearly ? (pkg.yearlyPrice !== 'Contact us' ? `$${pkg.yearlyPrice}` : pkg.yearlyPrice) : (pkg.monthlyPrice !== 'Contact us' ? `$${pkg.monthlyPrice}` : pkg.monthlyPrice)}
                                <span className="text-base text-tertiary font-medium">/{isYearly ? 'year' : 'month'}</span>
                            </p>
                            <ul className="plan-features mt-4 space-y-2 px-4">
                                <li className="flex items-center">
                                    <FcInfo className="mr-2 text-xl" />
                                    APIs: {pkg.name === 'Free' ? 'Available now' : 'All Assistants'}
                                </li>
                                <li className="flex items-center">
                                    <FcInfo className="mr-2 text-xl" />
                                    Support: 
                                    <img 
                                        src={pkg.name === 'Free' ? '/img/free.png' : 
                                             pkg.name === 'Basic' ? '/img/basic.png' : 
                                             pkg.name === 'Advanced' ? '/img/advanced.png' : 
                                             '/img/enterprise.png'} 
                                        alt={pkg.name} 
                                        className="support-logo ml-2" 
                                    />
                                </li>
                                <li className="flex items-center">
                                    <FcInfo className="mr-2 text-xl" />
                                    Additional practical tasks
                                </li>
                                <li className="flex items-center">
                                    <FcInfo className="mr-2 text-xl" />
                                    Monthly conferences
                                </li>
                                <li className="flex items-center">
                                    <FcInfo className="mr-2 text-xl" />
                                    Personal advice from teachers
                                </li>
                            </ul>
                            <div className="button-container w-full mx-auto flex items-center justify-center mt-5">
                                <button className="get-started-button mt-6 px-10 text-secondary py-2 border border-secondary hover:bg-secondary hover:text-white font-semibold py-2 rounded-lg">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Pricing;
