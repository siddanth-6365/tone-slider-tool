import Header from "../components/commons/Header";
import ToneAdjuster from "../components/ToneAdjuster";
import { Toaster } from "../components/ui/sonner";

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full z-10 max-w-7xl mx-auto p-2 lg:p-8">
        <Header />
        <ToneAdjuster />
      </div>

      <Toaster />
    </div>
  );
}

export default Home;