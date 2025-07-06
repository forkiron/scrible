import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import header from "../assets/header.png";
import back from "../assets/back.png";
import flower from "../assets/flower.gif";

const Option = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-lined-paper h-screen w-screen flex justify-center relative overflow-hidden">
      <motion.img
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 0.85 }}
        transition={{ duration: 3 }}
        src={flower}
        className="absolute w-24 bottom-20 right-20"
        alt=""
      />
      <motion.button
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 0.85 }}
        transition={{ duration: 3 }}
        onClick={() => navigate("/")}
      >
        <button onClick={() => navigate("/")}>
          <motion.img
            className="absolute top-5 left-20 w-16 opacity-85"
            src={back}
            alt="Back"
            whileHover={{ scale: 1.2, rotate: -15 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </button>
      </motion.button>

      {/* Header fade-in from the top */}
      <motion.img
        className="absolute w-64 py-6"
        src={header}
        alt=""
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <div className="flex justify-center items-center gap-20">
        <motion.button
          onClick={() => navigate("/Digi", { state: { style: "handwritten" } })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          whileHover="hover"
        >
          <div className="relative">
            <div className="absolute top-2 right-2 w-90 h-70 bg-yellow-800 rotate-[-2deg] rounded-xl"></div>
            <div
              className="relative w-90 h-70 sticky-details-left rotate-[-2deg] bg-yellow-400 rounded-xl folded-corner flex flex-col items-center justify-center text-black text-3xl cursor-pointer "
              style={{ fontFamily: "caveat, variable" }}
            >
              <motion.div
                className="font-bold underline text-shadow-sm"
                variants={{ hover: { scale: 1.1 } }}
              >
                Handwritten style
              </motion.div>
              <motion.div
                className="text-shadow-sm"
                variants={{ hover: { scale: 1.1 } }}
              >
                Original. With a buttery finish.
              </motion.div>
              <motion.div
                className="text-6xl text-shadow-lg"
                variants={{ hover: { scale: 1.1 } }}
              >
                🧈✍️
              </motion.div>
            </div>
          </div>
        </motion.button>

        {/* Second sticky note with text scale on hover */}
        <motion.button
          onClick={() => navigate("/Digi", { state: { style: "text" } })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          whileHover="hover"
        >
          <div className="relative">
            <div className="absolute top-2 left-2 w-90 h-70 bg-sky-800 rotate-[3deg] rounded-xl"></div>
            <div
              className="relative w-90 h-70 sticky-details rotate-[3deg] bg-sky-300 rounded-xl folded-corner flex flex-col items-center justify-center text-black text-2xl cursor-pointer"
              style={{ fontFamily: "varela round, variable" }}
            >
              <motion.div
                className="font-extrabold underline"
                variants={{ hover: { scale: 1.1 } }}
              >
                Text font
              </motion.div>
              <motion.div className="" variants={{ hover: { scale: 1.1 } }}>
                Sleek, modern, perfect for assignments.
              </motion.div>
              <motion.div
                className="text-6xl text-shadow-lg"
                variants={{ hover: { scale: 1.1 } }}
              >
                📖
              </motion.div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Option;
