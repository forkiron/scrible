import { motion } from "framer-motion";
import rain from "../assets/scribrain.png";
import smile from "../assets/smile.gif";
import scrib from "../assets/scrib.gif";
import star from "../assets/star.gif";

const Decor = () => {
  return (
    <div>
      <div className="relative h-screen w-screen">
        <motion.img
          className="absolute w-24 top-23 left-36"
          src={smile}
          alt=""
          animate={{
            y: [0, -30, 0], // bigger float
            rotate: [0, 25, -25, 0], // more dramatic spin
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.img
          className="absolute w-96 rotate-12 opacity-75 top-19 right-14"
          src={rain}
          alt=""
          animate={{
            y: [0, 20, 0], // slow floating drift
            rotate: [12, 14, 10, 12], // subtle swaying
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.img
          className="absolute w-64 bottom-23 left-35 opacity-85"
          src={scrib}
          alt=""
          animate={{
            y: [0, -40, 0], // larger bob
            rotate: [-15, 15, -15], // pronounced rocking
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.img
          className="absolute w-24 bottom-15 right-45 opacity-85"
          src={star}
          alt=""
          animate={{
            scale: [1, 1.4, 1], // bigger twinkle
            rotate: [0, 40, -40, 0], // playful spin with more rotation
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

export default Decor;
