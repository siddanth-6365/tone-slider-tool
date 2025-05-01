import Header from "@/components/commons/Header";
import ToneController from "@/components/ToneController";
import { Toaster } from "@/components/ui/sonner";

function Home() {
  return (
    <>
      <title>Tone Slider Text Tool</title>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full z-10 max-w-7xl mx-auto p-2 lg:p-8">
          <Header />
          <ToneController />
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default Home;