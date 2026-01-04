import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ResumePilot - AI-Powered Resume Editor",
    description: "JSON-first resume editor with AI-driven edits and LaTeX PDF generation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
