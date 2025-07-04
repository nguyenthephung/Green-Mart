import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white mt-12 py-8 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="flex flex-col items-center md:items-start">
          <img
            src="https://via.placeholder.com/100x50?text=Logo"
            alt="Footer Logo"
            className="h-12 mb-4 rounded-md shadow-md transform hover:scale-105 transition-transform duration-200"
          />
          <p className="text-sm text-gray-300">Your trusted platform for shopping.</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-3 text-green-400">About</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/branches" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                Our Branches
              </Link>
            </li>
            <li>
              <Link to="/changelog" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                Changelog
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-3 text-green-400">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/faqs" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/recipes" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                Recipes
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-3 text-green-400">Help & Support</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/terms" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                Terms of Privacy
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/security" className="text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200">
                Security
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-3 text-green-400">Social</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200"
              >
                <FaFacebook /> Facebook
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200"
              >
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transform hover:translate-x-1 transition-all duration-200"
              >
                <FaTwitter /> Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center py-4 mt-6 border-t border-gray-700 text-xs text-gray-400">
        © 2025 EnvatoStudio. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;