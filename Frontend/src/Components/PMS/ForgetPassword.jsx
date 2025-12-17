import React from "react";
import ethiopian_civil_service_commistion_logo from "../Assets/ethiopian_civil_service_commistion_logo.png";
import EaiiLogin from "../Assets/EaiiLoginicon.png";
import ForgetPasswordContainer from "./ForgetPasswordContainer";
import { CheckCircle, Security, Email, OpenInNew } from "@mui/icons-material";

const ForgetPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs - Responsive sizing */}
        <div className="absolute -top-20 sm:-top-30 md:-top-40 -right-20 sm:-right-30 md:-right-40 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-30 md:-bottom-40 -left-20 sm:-left-30 md:-left-40 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Panel - Brand Section */}
            <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-900 p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-20 sm:w-24 md:w-28 lg:w-32 h-20 sm:h-24 md:h-28 lg:h-32 bg-white rounded-full -translate-x-10 sm:-translate-x-12 md:-translate-x-14 lg:-translate-x-16 -translate-y-10 sm:-translate-y-12 md:-translate-y-14 lg:-translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-20 sm:w-24 md:w-28 lg:w-32 h-20 sm:h-24 md:h-28 lg:h-32 bg-white rounded-full translate-x-10 sm:translate-x-12 md:translate-x-14 lg:translate-x-16 translate-y-10 sm:translate-y-12 md:translate-y-14 lg:translate-y-16"></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-center">
                {/* Logo */}
                <div className="flex justify-center mb-6 sm:mb-7 md:mb-8">
                  <div className="bg-white/20 p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/30">
                    <img
                      src={EaiiLogin}
                      alt="Ethiopian Artificial Intelligence Institute"
                      className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
                    />
                  </div>
                </div>

                {/* Institute Info */}
                <div className="text-center mb-6 sm:mb-7 md:mb-8">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">
                    Ethiopian Artificial Intelligence Institute
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white/90 mb-1 sm:mb-2">
                    PROJECT MANAGEMENT SYSTEM
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base mt-3 sm:mt-4">
                    Recover access to your account securely
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-6 sm:mb-7 md:mb-8">
                  <div className="flex items-center">
                    <Security
                      style={{
                        fontSize: "clamp(16px, 1.5vw, 20px)",
                        color: "#86EFAC",
                        marginRight: "clamp(8px, 1vw, 12px)",
                        flexShrink: 0,
                      }}
                    />
                    <span className="text-white/90 text-sm sm:text-base">
                      Secure Password Recovery
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Email
                      style={{
                        fontSize: "clamp(16px, 1.5vw, 20px)",
                        color: "#86EFAC",
                        marginRight: "clamp(8px, 1vw, 12px)",
                        flexShrink: 0,
                      }}
                    />
                    <span className="text-white/90 text-sm sm:text-base">
                      Email Verification
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle
                      style={{
                        fontSize: "clamp(16px, 1.5vw, 20px)",
                        color: "#86EFAC",
                        marginRight: "clamp(8px, 1vw, 12px)",
                        flexShrink: 0,
                      }}
                    />
                    <span className="text-white/90 text-sm sm:text-base">
                      Quick Account Access
                    </span>
                  </div>
                </div>

                {/* Learn More Button */}
                <div className="text-center">
                  <a
                    href="https://aii.et/"
                    className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-200 text-sm sm:text-base md:text-base transform hover:-translate-y-0.5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More About Us
                    <OpenInNew
                      style={{
                        fontSize: "clamp(14px, 1vw, 16px)",
                        marginLeft: "clamp(4px, 0.5vw, 8px)",
                      }}
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Panel - Forgot Password Form */}
            <div className="bg-white p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 flex items-center justify-center">
              <ForgetPasswordContainer />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-5 md:mt-6 px-2">
          <p className="text-black/70 text-xs sm:text-sm">
            © 2025 Ethiopian Artificial Intelligence Institute. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
