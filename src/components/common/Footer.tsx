import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#e2ddd4] bg-[#eeeae2] px-6 py-7">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-[#7b8385] sm:flex-row sm:text-left">
        <p><span className="font-serif font-semibold text-[#3a4548]">Papertrail</span> · Write together, beautifully.</p>
        <p>© {new Date().getFullYear()} Papertrail Studio</p>
      </div>
    </footer>
  );
};

export default Footer;