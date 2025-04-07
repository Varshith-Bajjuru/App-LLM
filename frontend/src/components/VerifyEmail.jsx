import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");

        if (!token) {
          setVerificationStatus("error");
          return;
        }

        const response = await axios.post(
          "http://localhost:5000/api/auth/verify-email",
          { token }
        );

        if (response.data.verified) {
          setVerificationStatus("success");
          // Redirect to login after 3 seconds on success
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setVerificationStatus("error");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Email Verification
        </h2>

        {verificationStatus === "verifying" && (
          <div className="text-blue-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p>Verifying your email...</p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-green-400">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p>Email verified successfully!</p>
            <p className="mt-2 text-sm text-gray-400">
              Redirecting to login...
            </p>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-red-400">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p>Verification token is required</p>
            <button
              onClick={() => navigate("/register")}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
            >
              Register Again
            </button>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-full"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
