import React, { useState, useEffect } from "react";
import tower from "../assets/tower-icon.png";

const PollingResult = ({ socket, askAnotherQuestion }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const handleNewQuestion = (question) => {
      setCurrentQuestion(question);
    };

    socket.on("new-question", handleNewQuestion);
    return () => socket.off("new-question", handleNewQuestion);
  }, [socket]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <img src={tower} alt="Live" className="w-6 h-6" />
          <h2 className="text-2xl font-semibold">Live Results</h2>
        </div>
      </div>

      {currentQuestion && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-3 font-medium">
            {currentQuestion.question}
          </div>
          <div className="divide-y">
            {Object.entries(currentQuestion.optionsFrequency).map(
              ([option], index) => {
                const percent = parseInt(currentQuestion.results?.[option] || 0);

                return (
                  <div key={index} className="p-4">
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center gap-2 font-medium text-gray-800">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-500 text-white text-xs">
                          {index + 1}
                        </span>
                        {option}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button onClick={askAnotherQuestion} className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition">
          + Ask a new question
        </button>
      </div>
    </div>
  );
};

export default PollingResult;
