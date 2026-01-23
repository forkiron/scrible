import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import rain from "../assets/scribrain.png";
import smile from "../assets/smile.gif";
import scrib from "../assets/scrib.gif";
import star from "../assets/star.gif";
import logo from "../assets/logo.gif";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-lined-paper overflow-x-hidden font-mynerve text-zinc-800 selection:bg-purple-200 relative">
      
      {/* Background Decorations from Decor.tsx */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <motion.img
          className="absolute w-20 top-10 left-10"
          src={smile}
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          className="absolute w-48 top-16 right-16 rotate-12"
          src={rain}
          animate={{ y: [0, 10, 0], rotate: [12, 14, 12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          className="absolute w-40 bottom-32 left-16"
          src={scrib}
          animate={{ y: [0, -20, 0], rotate: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          className="absolute w-16 bottom-16 right-1/4"
          src={star}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 20, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 pt-24 pb-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Content: Headline & Text */}
        <div className="flex-1 lg:mt-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-6">
              <span className="text-[#6d4da1] block lg:inline">AI Agents</span> <span className="hidden lg:inline">That</span>
              <br className="hidden lg:block" />
              <span className="lg:hidden">That</span> Increase <br />
              Enrollment <br />
              Across Campus.
            </h1>
          </motion.div>
          
          <motion.div 
            className="space-y-4 mb-10 mx-auto lg:mx-0 max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <p className="text-xl md:text-2xl font-bold leading-tight">
              The agentic operating system for higher education.
            </p>
            <p className="text-base md:text-lg leading-relaxed opacity-90 font-medium">
              Risely orchestrates AI agents across your university - 
              optimizing operations, scaling support, & maximizing revenue.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center lg:justify-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <button 
              onClick={() => navigate("/Option")}
              className="sketchy-button-purple text-lg md:text-xl px-12 py-3 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Get Started
            </button>
          </motion.div>
        </div>

        {/* Right Content: Actual Logo Asset */}
        <div className="flex-1 flex justify-center items-center relative w-full max-w-xl">
          <motion.div 
            className="relative w-full flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.3 }}
          >
            <img 
              src={logo} 
              alt="Scrible Logo" 
              className="w-full h-auto max-w-[500px] drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Floating Information Sections */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 pb-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Inspiration Section */}
          <motion.div
            className="relative bg-white border-[3px] border-zinc-900 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]"
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#6d4da1]">
              Inspiration
            </h2>
            <div className="space-y-3 text-base md:text-lg leading-relaxed">
              <p>
                Handwriting is a skill that's easy to take for granted! However, many motor, muscular, neurological, and developmental health conditions impair individuals' abilities to write freely with pen and paper.
              </p>
              <p className="font-semibold">
                These disadvantaged populations deserve more than diversity: they deserve <span className="text-[#6d4da1]">inclusion</span>.
              </p>
              <p>
                Enabling ethical & effective education means using new innovations to meet the needs of all communities. Novel technologies like AI can allow the target population to engage with written activities in the same way as their able-bodied peers.
              </p>
            </div>
            {/* Hand-drawn underline */}
            <div className="mt-4">
              <svg viewBox="0 0 200 10" className="w-full h-3 opacity-60">
                <path 
                  d="M5,5 Q50,2 100,5 T195,5" 
                  fill="none" 
                  stroke="#6d4da1" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>

          {/* What It Does Section */}
          <motion.div
            className="relative bg-[#fffef4] border-[3px] border-zinc-900 rounded-[15px_255px_15px_225px/225px_15px_255px_15px] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]"
            initial={{ opacity: 0, y: 30, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 1.4, duration: 0.8, type: "spring" }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2ea9df]">
              What It Does
            </h2>
            <div className="space-y-3 text-base md:text-lg leading-relaxed">
              <p>
                <span className="font-bold">Scrible</span> extracts handwriting, written by someone with the aforementioned conditions, from an uploaded file, or from a photo captured using the device's webcam.
              </p>
              <p className="font-semibold">
                It will then transcribe the handwriting into a more <span className="text-[#2ea9df]">legible text</span>, allowing the user to effectively convey their ideas through written media!
              </p>
              <p className="text-sm md:text-base italic opacity-80">
                ✨ Making written communication accessible for everyone ✨
              </p>
            </div>
            {/* Hand-drawn squiggle */}
            <div className="mt-4">
              <svg viewBox="0 0 200 12" className="w-full h-4 opacity-60">
                <path 
                  d="M5,6 C30,2 70,10 100,6 C130,2 170,10 195,6" 
                  fill="none" 
                  stroke="#2ea9df" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Notebook margin line */}
      <div className="fixed top-0 left-20 bottom-0 w-[2px] bg-[#fca5a5] opacity-40 z-0" />
      
      {/* Subtle grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
    </div>
  );
};

export default Landing;
