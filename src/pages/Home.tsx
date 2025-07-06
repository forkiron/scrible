import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import start from "../assets/start.png";
import Decor from "../components/Decor";
import logo from "../assets/logo.gif";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen overflow-hidden bg-lined-paper">
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Decor />
      </div>

      <div className="h-screen flex justify-center items-center">
        <motion.div
          className="flex flex-col items-center font-mynerve"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.img
            className="w-150"
            src={logo}
            alt=""
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: 0.3,
            }}
          />

          <motion.button
            onClick={() => navigate("/Option")}
            className="start-sizing rounded cursor-pointer mt-8"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95, rotate: -5 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 1,
            }}
          >
            <motion.div className="relative">
              <img className="w-max" src={start} alt="" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center start-text text-white text-shadow-md"
                style={{ fontFamily: "Mynerve, cursive" }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                Begin scanning...
              </motion.div>
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
