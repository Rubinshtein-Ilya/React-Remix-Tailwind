import React from "react";
import { Outlet, useLocation, useNavigation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

const RootLayout: React.FC = () => {
  const location = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="relative">
      {isLoading && (
        <>
          <div className="fixed top-0 left-0 right-0 h-0.5 bg-blue-500 z-[60]">
            <motion.div
              className="h-full bg-blue-300"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-[45]"
          />
        </>
      )}
      <AnimatePresence mode="sync">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RootLayout;
