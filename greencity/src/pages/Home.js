import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart, Leaf, Users, Building2, MessageSquare, Recycle } from 'lucide-react';

const Home = () => {

  const features = [
    {
      path: "/events",
      title: "Eco-Events & Campaigns",
      description: "Find and join local sustainability events.",
      icon: <Users className="w-8 h-8 text-white" />,
      color: "bg-teal-500"
    },
    {
      path: "/businesses",
      title: "Green Business Directory",
      description: "Support local eco-friendly businesses.",
      icon: <Building2 className="w-8 h-8 text-white" />,
      color: "bg-lime-500"
    },
    {
      path: "/tracker",
      title: "Citizen Action Tracker",
      description: "Log your actions and earn rewards.",
      icon: <BarChart className="w-8 h-8 text-white" />,
      color: "bg-yellow-500"
    },
    {
      path: "/waste-hub",
      title: "Waste Management Hub",
      description: "Find recycling centers and guides.",
      icon: <Recycle className="w-8 h-8 text-white" />,
      color: "bg-sky-500"
    },
    {
      path: "/forum",
      title: "Discussion Forum",
      description: "Share ideas and collaborate on solutions.",
      icon: <MessageSquare className="w-8 h-8 text-white" />,
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="space-y-20 md:space-y-28 pb-10">
      {/* Hero Section */}
      <div 
        className="relative text-white rounded-lg shadow-xl -mt-8 -mx-4 md:-mx-8 h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/windmill.jpeg)" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
        <div className="relative z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Green City Connect
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Where conscious citizens collaborate towards a cleaner and safer future.
          </p>
          <NavLink 
            to="/register" 
            className="bg-white text-green-700 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition-transform hover:scale-105 duration-300"
          >
            Get Started
          </NavLink>
        </div>
      </div>

      {/* Introduction Section with SDG Image */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-600 mb-4 text-lg italic">
              “Yaadhum Oore Yaavarum Kelir”
            </p>
            <p className="text-gray-700">
              This ancient concept of global citizenship is the rationale behind our platform. Green City Connect is your one-stop destination to discover everything sustainable in your community—from eco-friendly cafes to waste management hubs. Are you a silent action taker? Don’t hold back your sustainability wins! Log them on our tracker page to compete with other sustainability super-champs.
            </p>
          </div>
          <div className="flex justify-center">
            <img src="/images/sdg11.png" alt="Sustainable Cities and Communities Goal 11" className="w-64 h-64 rounded-lg shadow-2xl object-cover transform hover:scale-105 transition-transform duration-300" />
          </div>
        </div>
      </div>
      
      {/* Key Statistics Section */}
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our City's Goals</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
            <Leaf className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-4xl font-bold text-green-700">75%</h3>
            <p className="text-gray-600 mt-2">Waste Diversion from Landfills</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-4xl font-bold text-blue-700">-25%</h3>
            <p className="text-gray-600 mt-2">Air Quality Index Improvement</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
            <BarChart className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-4xl font-bold text-yellow-700">40%</h3>
            <p className="text-gray-600 mt-2">Reduction in Energy Consumption</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Explore & Get Involved</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            <NavLink 
              key={feature.title}
              to={feature.path} 
              className="group block p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${feature.color} mb-4 transition-transform group-hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </NavLink>
          ))}
        </div>
      </div>

      {/* SDG Goals Image Section */}
      <div className="max-w-4xl mx-auto px-4 text-center">
         <h2 className="text-3xl font-bold text-gray-800 mb-8">Part of a Global Mission</h2>
         <img src="/images/SDG_all_goals.webp" alt="All Sustainable Development Goals" className="rounded-lg shadow-lg object-contain w-full"/>
      </div>

    </div>
  );
};

export default Home;
