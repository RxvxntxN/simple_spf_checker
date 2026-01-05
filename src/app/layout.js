
import "./globals.css";

export const metadata = {
  title: "Simple SPF Checker task",
  description: "Learning first SPF with Musabbir",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
