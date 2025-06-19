import React, { useState, useEffect, useRef } from "react";
import tower from "../assets/tower-icon.png";

const Student = ({ socket }) => {
  const [name, setName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [connectedStudents, setConnectedStudents] = useState(null);
  const [votingValidation, setVotingValidation] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const savedName = sessionStorage.getItem("studentName");
    if (savedName) {
      setName(savedName);
      setShowQuestion(true);
      socket.emit("student-set-name", { name: savedName });
    }

    const handleNewQuestion = (question) => {
      if (currentQuestion?.question === question.question) return;
      setCurrentQuestion(question);
      setShowQuestion(true);
      setSelectedOption("");

      setRemainingTime(question.timer);

      if (intervalRef.current) clearInterval(intervalRef.current);


  intervalRef.current = setInterval(() => {
  setRemainingTime((prev) => {
    if (prev <= 1) {
      clearInterval(intervalRef.current);
      setShowQuestion(false);
      return 0;
    }
    return prev - 1;
  });
}, 1000);
    };

    const handleStudentVoteValidation = (connected) => {
      setConnectedStudents(connected);
    };

    socket.on("new-question", handleNewQuestion);
    socket.on("student-vote-validation", handleStudentVoteValidation);

    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("student-vote-validation", handleStudentVoteValidation);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [socket]);

  const handleSubmit = () => {
    sessionStorage.setItem("studentName", name);
    socket.emit("student-set-name", { name });
    setShowQuestion(true);
  };

  const handlePolling = () => {
    socket.emit("handle-polling", { option: selectedOption });
  };

  useEffect(() => {
    const found = connectedStudents?.find((data) => data.socketId === socket.id);
    if (found) {
      setVotingValidation(found.voted);
    }
  }, [connectedStudents]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4">
      {showQuestion && name ? (
        currentQuestion ? (
          currentQuestion.answered === false || votingValidation === false ? (
            <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Question</h3>
                <div className="text-sm font-semibold text-red-600">
                  ⏱️ 00:{String(remainingTime).padStart(2, '0')}
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 font-medium">
                  {currentQuestion.question}
                </div>
                <div className="bg-gray-100 p-4 space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedOption(option)}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedOption === option
                          ? "border border-purple-500 bg-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedOption === option
                            ? "border-purple-600 bg-purple-500"
                            : "border-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-800">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handlePolling}
                  disabled={!selectedOption}
                  className={`px-6 py-2 rounded-full text-white font-semibold ${
                    selectedOption
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl p-6 border border-gray-300 rounded-lg bg-gray-50 shadow mt-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src={tower} alt="Live" className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Live Results</h2>
              </div>
              {Object.entries(currentQuestion.optionsFrequency).map(([option], index) => {
                const percent = parseInt(currentQuestion.results?.[option] || 0);
                return (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{option}</span>
                      <span className="text-sm">{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-500 ease-in-out"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              🎯 Interview Poll
            </span>
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Wait for the teacher to ask questions..
            </h2>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center gap-4 text-center w-full max-w-lg">
          <h2 className="text-2xl font-bold text-gray-800">Enter your name to participate in the contest</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`px-6 py-2 rounded-md text-white font-semibold ${
              name.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Student;
