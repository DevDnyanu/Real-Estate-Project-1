import React from "react";
import { Hero } from "@/components/Hero";
import { PackageSelection } from "@/components/PackageSelection";
import { Footer } from "@/components/Footer";
import Header from "./Header";
import Navbar from "./navbar";
import Listings from "./Listings";
import ListingsPage from './ListingsPage';



type HomeProps = {
  currentLang: "en" | "hi";
  onLogout: () => void;
};

const Home: React.FC<HomeProps> = ({ currentLang, onLogout }) => {
  const handlePackageSelect = (packageType: string) => {
    console.log("Selected package:", packageType);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={currentLang} onLogout={onLogout} />

      <main>
        <Hero currentLang={currentLang} />
        <Listings />
      <ListingsPage />
        <PackageSelection
          currentLang={currentLang}
          onSelectPackage={handlePackageSelect}
        />
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
};

export default Home;
