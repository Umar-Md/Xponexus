import "./globals.css";

export const metadata = {
  title: "XPONEXUS | Structural Design & Engineering",
  description: "XPONEXUS structural design and engineering portfolio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
