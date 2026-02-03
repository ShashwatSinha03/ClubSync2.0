import { Outfit } from "next/font/google";

import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Saarang Music Club",
  description: "Official portal for Saarang Music Club, Rishihood University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.variable}>
            <AuthProvider>
                <Navbar />
                <main className="container">
                    {children}
                </main>
            </AuthProvider>
      </body>
    </html>
  );
}
