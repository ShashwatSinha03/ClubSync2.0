import { Nunito_Sans, Spinnaker } from "next/font/google";

import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const spinnaker = Spinnaker({
  variable: "--font-spinnaker",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Saarang Music Club",
  description: "Official portal for Saarang Music Club, Rishihood University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${spinnaker.variable}`}>
            <ThemeProvider>

                <div className="layout-content">
                  <AuthProvider>
                      {children}
                  </AuthProvider>
                </div>
            </ThemeProvider>
      </body>
    </html>
  );
}
