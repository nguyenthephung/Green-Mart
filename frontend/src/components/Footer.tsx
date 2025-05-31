export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-12 text-sm text-gray-700">
      <div className="max-w-content mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 p-6">
        <div>
          <h4 className="font-semibold mb-2">About</h4>
          <ul>
            <li>About Us</li>
            <li>Our Branches</li>
            <li>Changelog</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul>
            <li>FAQs</li>
            <li>Recipes</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Help & Support</h4>
          <ul>
            <li>Terms of Privacy</li>
            <li>Privacy Policy</li>
            <li>Security</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul>
            <li>Blog</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Social</h4>
          <ul>
            <li>Facebook</li>
            <li>Instagram</li>
            <li>Twitter</li>
          </ul>
        </div>
      </div>
      <div className="text-center py-4 border-t text-xs">© 2024 EnvatoStudio. All rights reserved.</div>
    </footer>
  );
}
