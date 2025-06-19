import React, { useState } from "react";
import io from "socket.io-client";
import Teacher from "./components/Teacher";
import Student from "./components/Student";

const socket = io.connect("https://live-polling-app-pmca.onrender.com/");

const App = () => {
  const [role, setRole] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleContinue = () => {
    if (role === "teacher") setSubmitted("teacher");
    else if (role === "student") setSubmitted("student");
  };

  if (submitted === "teacher") return <Teacher socket={socket} />;
  if (submitted === "student") return <Student socket={socket} />;

  return (
    <div className="flex items-center justify-center h-screen bg-white text-gray-900">
      <div className="flex flex-col items-center text-center px-4">
        <span className="bg-[#6b46c1] text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
          🎯 Interview Poll
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold mb-2">
          Welcome to the <span className="font-bold text-black">Live Polling System</span>
        </h1>
        <p className="text-sm text-gray-600 mb-10">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div
            onClick={() => setRole("student")}
            className={`w-64 p-5 rounded-xl border cursor-pointer text-left ${
              role === "student" ? "border-blue-600 shadow-lg" : "border-gray-200"
            }`}
          >
            <h2 className="font-semibold mb-1">I'm a Student</h2>
            <p className="text-sm text-gray-500">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>
          <div
            onClick={() => setRole("teacher")}
            className={`w-64 p-5 rounded-xl border cursor-pointer text-left ${
              role === "teacher" ? "border-blue-600 shadow-lg" : "border-gray-200"
            }`}
          >
            <h2 className="font-semibold mb-1">I'm a Teacher</h2>
            <p className="text-sm text-gray-500">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!role}
          className={`px-8 py-2 rounded-full text-white font-semibold transition ${
            role
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default App;
