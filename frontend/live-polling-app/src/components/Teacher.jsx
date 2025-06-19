import React, { useState } from "react";
import PollingResult from "./PollingResult";

const Teacher = ({ socket }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOptions, setCorrectOptions] = useState([false, false]);
  const [questionPublished, setQuestionPublished] = useState(false);
  const [timer, setTimer] = useState(60); 
  const askQuestion = () => {
    const finalOptions = options.filter(opt => opt.trim() !== "");
    if (socket && question && finalOptions.length) {
      socket.emit("teacher-ask-question", {
        question,
        options: finalOptions,
        correctOptions,
        timer,
      });
      setQuestionPublished(true);
    }
  };

  const addOption = () => {
    setOptions([...options, ""]);
    setCorrectOptions([...correctOptions, false]);
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const updateCorrectOption = (index, value) => {
    const updated = [...correctOptions];
    updated[index] = value;
    setCorrectOptions(updated);
  };

  const askAnotherQuestion = () => {
    setQuestionPublished(false);
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOptions([false, false]);
    setTimer(60);
  };

  if (questionPublished) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-10 px-4">
        <PollingResult socket={socket} askAnotherQuestion={askAnotherQuestion}/>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-10 text-gray-800">
      <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">
        🎯 Interview Poll
      </span>
      <h1 className="text-3xl font-bold mb-2">Let’s <span className="text-black">Get Started</span></h1>
      <p className="text-gray-500 mb-6">
        You’ll have the ability to create and manage polls, ask questions, and monitor your students’ responses in real-time.
      </p>

      <div className="mb-6">
        <label className="block font-medium mb-2">Enter your question</label>
        <div className="flex justify-between items-center mb-2">
          <span></span>
          <select
            className="border rounded px-3 py-1 text-sm text-gray-700"
            value={timer}
            onChange={(e) => setTimer(parseInt(e.target.value))}
          >
            {[30, 60, 90].map((val) => (
              <option key={val} value={val}>{val} seconds</option>
            ))}
          </select>
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={100}
          className="w-full p-4 border bg-gray-100 rounded-md focus:outline-none"
          placeholder="Type your question here..."
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {question.length}/100
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Edit Options</h3>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-4 mb-3">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center">{index + 1}</span>
            <input
              type="text"
              className="flex-grow px-3 py-2 rounded-md bg-gray-100 border focus:outline-none"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <div className="flex gap-2 items-center">
              <label className="text-sm">Is it Correct?</label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={correctOptions[index] === true}
                  onChange={() => updateCorrectOption(index, true)}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={correctOptions[index] === false}
                  onChange={() => updateCorrectOption(index, false)}
                  className="mr-1"
                />
                No
              </label>
            </div>
          </div>
        ))}

        <button
          onClick={addOption}
          className="mt-2 px-4 py-2 rounded border border-purple-600 text-purple-600 text-sm font-medium hover:bg-purple-50"
        >
          + Add More option
        </button>
      </div>

      <div className="mt-10 text-right">
        <button
          onClick={askQuestion}
          className="px-6 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition"
        >
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default Teacher;
