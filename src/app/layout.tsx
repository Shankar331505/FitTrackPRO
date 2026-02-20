import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FitTrack Pro - Complete Fitness Tracking",
    description: "Track nutrition, workouts, and achieve your fitness goals with AI-powered recommendations",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppProvider>
                    {children}
                </AppProvider>
            </body>
        </html>
    );
}
