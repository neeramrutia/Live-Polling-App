const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const server = http.createServer(app);
const allowedOrigins = [
  "https://live-polling-app-omega.vercel.app",
  "http://localhost:5173"
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

const __dirname1 = path.resolve(__dirname, "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname1));
  app.get("*", (req, res) => {
    const indexfile = path.join(__dirname1, "index.html");
    return res.sendFile(indexfile);
  });
}
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

server.listen(process.env.PORT || 3001, () => {
  console.log("server is running");
});

let currentQuestion = {};
const connectedStudents = new Map();

io.on("connection", (socket) => {
  socket.on("teacher-ask-question", (questionData) => {
    const question = {
      question: questionData.question,
      options: questionData.options,
      optionsFrequency: {},
      answered: false,
      results: {},
      timer: questionData.timer,
    };

    question.options.forEach((option) => {
      question.optionsFrequency[option] = 0;
    });

    currentQuestion = question;

    io.emit("new-question", question);

    setTimeout(() => {
      if (!currentQuestion.answered) {
        const totalResponses = Object.values(
          currentQuestion.optionsFrequency
        ).reduce((acc, ans) => acc + ans, 0);

        Object.keys(currentQuestion.optionsFrequency).forEach((option) => {
          const percentage =
            (currentQuestion.optionsFrequency[option] / totalResponses) * 100;
          currentQuestion.results[option] = percentage || 0;
        });

        currentQuestion.answered = true;
        io.emit("polling-results", currentQuestion.results);
      }
    }, questionData.timer * 1000);
  });

  socket.on("handle-polling", ({ option }) => {
    if (currentQuestion && currentQuestion.options?.includes(option)) {
      currentQuestion.optionsFrequency[option] =
        (currentQuestion.optionsFrequency[option] || 0) + 1;

      const totalResponses = Object.values(
        currentQuestion.optionsFrequency
      ).reduce((acc, ans) => acc + ans, 0);

      Object.keys(currentQuestion.optionsFrequency).forEach((opt) => {
        const percentage =
          (currentQuestion.optionsFrequency[opt] / totalResponses) * 100;
        currentQuestion.results[opt] = percentage || 0;
      });

      currentQuestion.answered = true;

      const student = connectedStudents.get(socket.id);
      if (student) {
        student.voted = true;
        connectedStudents.set(socket.id, student);
        io.emit("student-vote-validation", [...connectedStudents.values()]);
      }

      io.emit("new-question", currentQuestion);
      io.emit("polling-results", currentQuestion.results);
    }
  });

  socket.on("student-set-name", ({ name }) => {
    const student = {
      name,
      socketId: socket.id,
      voted: false,
    };

    connectedStudents.set(socket.id, student);
    console.log(`Student ${name} connected`);

    io.emit("student-connected", Array.from(connectedStudents.values()));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    connectedStudents.delete(socket.id);
    io.emit("student-disconnected", Array.from(connectedStudents.values()));
  });
});
