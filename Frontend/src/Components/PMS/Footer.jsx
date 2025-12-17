import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white/90 px-4 py-2 text-center shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-gray-900 font-serif text-sm sm:text-base">
          <span className="text-blue-800 font-bold not-italic mr-1">©</span>
          <span className="italic font-medium text-gray-800">
            {currentYear} Ethiopian Artificial Intelligence Institute
          </span>
          <span className="text-blue-600 mx-2 font-light">|</span>
          <span className="text-gray-600 text-xs font-light not-italic">
            Artificial Intelligence, For all Ethiopians
          </span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
