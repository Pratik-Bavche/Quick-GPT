import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Loading = () => {
  const { fetchUser, user, axios, token } = useAppContext();
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const checkCreditsManually = async () => {
    try {
      const { data } = await axios.post("/api/credit/check", {}, {
        headers: { Authorization: token }
      });
      
      if (data.success && data.creditsUpdated) {
        console.log("✅ Credits updated manually:", data.message);
        // Refresh user data to get updated credits
        await fetchUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking credits manually:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkUserCredits = async () => {
      try {
        // First try to check credits manually (fallback for webhook issues)
        if (location.pathname === "/loading" && retryCount === 0) {
          const creditsUpdated = await checkCreditsManually();
          if (creditsUpdated) {
            // If credits were updated, navigate immediately
            navigate("/");
            return;
          }
        }

        await fetchUser();
 
        // If user data is loaded and we have credits, navigate to home
        if (user && user.credits !== undefined) {
          // Only navigate to home if we're on the /loading route (payment return)
          if (location.pathname === "/loading") {
            navigate("/");
          }
          return;
        }
 
        // If no user data yet and we haven't exceeded retry limit, retry
        if (retryCount < 10) {
          setRetryCount((prev) => prev + 1);
          setTimeout(checkUserCredits, 1000); // Retry every 1 second
        } else {
          // After 10 retries (10 seconds), only navigate if we're on /loading route
          if (location.pathname === "/loading") {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (retryCount < 10) {
          setRetryCount((prev) => prev + 1);
          setTimeout(checkUserCredits, 1000);
        } else {
          // Only navigate if we're on /loading route
          if (location.pathname === "/loading") {
            navigate("/");
          }
        }
      }
    };

    // Only start checking if we're on the /loading route (payment return)
    if (location.pathname === "/loading") {
      checkUserCredits();
    }
  }, [retryCount, user, fetchUser, navigate, location.pathname, axios, token]);

  return (
    <div className="bg-gradient-to-b from-[#531881] to-[#29184B] backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-white text-2xl">
      <div className="w-10 h-10 rounded-full border-3 border-white border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Loading;
