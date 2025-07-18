import React from "react";

const Footer = () => (
    <footer className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-10 mt-10 shadow-inner">
    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <img
          src="/logo192.png"
          alt="JALAI Logo"
          className="w-12 h-12 rounded-full shadow-lg border-2 border-white"
        />
        <span className="text-2xl font-bold tracking-wide">JALAI</span>
      </div>
      <div className="flex gap-8 mb-4 md:mb-0 text-lg">
        <a href="#" className="hover:underline">
          Home
        </a>
        <a href="#" className="hover:underline">
          Trade
        </a>
        <a href="#" className="hover:underline">
          Donate
        </a>
        <a href="#" className="hover:underline">
          Contact
        </a>
      </div>
      <div className="flex gap-6">
        <a
          href="#"
          aria-label="Facebook"
          className="hover:text-blue-200"
        >
          <svg
            className="w-7 h-7 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 5.005 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17.005 22 12"></path>
          </svg>
        </a>
        <a
          href="#"
          aria-label="Twitter"
          className="hover:text-blue-200"
        >
          <svg
            className="w-7 h-7 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M22.46 6c-.77.35-1.6.59-2.46.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 8.99 4.07 7.13 1.64 4.16c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.85 1.94 3.63-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.12 2.91 3.99 2.94A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.72 8.72 0 0 0 24 4.59a8.48 8.48 0 0 1-2.54.7z"></path>
          </svg>
        </a>
        <a
          href="#"
          aria-label="Instagram"
          className="hover:text-blue-200"
        >
          <svg
            className="w-7 h-7 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41a4.92 4.92 0 0 1 1.75 1.01 4.92 4.92 0 0 1 1.01 1.75c.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43a4.92 4.92 0 0 1-1.01 1.75 4.92 4.92 0 0 1-1.75 1.01c-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41a4.92 4.92 0 0 1-1.75-1.01 4.92 4.92 0 0 1-1.01-1.75c-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43a4.92 4.92 0 0 1 1.01-1.75 4.92 4.92 0 0 1 1.75-1.01c.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07c-1.276.058-2.15.25-2.91.53a7.07 7.07 0 0 0-2.56 1.64A7.07 7.07 0 0 0 .6 4.142c-.28.76-.472 1.634-.53 2.91C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.276.25 2.15.53 2.91a7.07 7.07 0 0 0 1.64 2.56 7.07 7.07 0 0 0 2.56 1.64c.76.28 1.634.472 2.91.53C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.276-.058 2.15-.25 2.91-.53a7.07 7.07 0 0 0 2.56-1.64 7.07 7.07 0 0 0 1.64-2.56c.28-.76.472-1.634.53-2.91.058-1.28.07-1.684.07-4.948s-.012-3.668-.07-4.948c-.058-1.276-.25-2.15-.53-2.91a7.07 7.07 0 0 0-1.64-2.56A7.07 7.07 0 0 0 19.858.6c-.76-.28-1.634-.472-2.91-.53C15.668.012 15.264 0 12 0zM12 5.838A6.162 6.162 0 1 0 12 18.162 6.162 6.162 0 1 0 12 5.838zm0 10.162A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
          </svg>
        </a>
      </div>
    </div>
    <p className="text-center text-gray-200 mt-6 text-sm">
      © JALAI 2025. All rights reserved.
    </p>
  </footer>
);

export default Footer;