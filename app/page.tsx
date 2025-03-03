import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";

export default function HomePage() {
  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-20 mt-20 background-gradient">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-gray-300 sm:text-7xl">
          Transform your interior{" "}
          <span className="relative whitespace-nowrap text-gradient">
            <SquigglyLines />
            <span className="relative">with AI</span>
          </span>{" "}
          for everyone.
        </h1>
        <h2 className="mx-auto mt-12 max-w-xl text-lg text-gray-500 leading-7">
          Take a picture of your room and see how it looks in different styles. 
          100% free – redesign your room today.
        </h2>
        <Link
          className="bg-amber-600 rounded-xl text-white font-medium px-4 py-3 sm:mt-10 mt-8 hover:bg-amber-500 transition"
          href="/dream"
        >
          Generate your dream room
        </Link>
        
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl px-4">
          <div className="aspect-square relative rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image 
              src="/AdditionalAssets/1.png"
              alt="Interior design sample" 
              fill
              priority={true}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="aspect-square relative rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image 
              src="/AdditionalAssets/2.png" 
              alt="Interior design sample" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="aspect-square relative rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image 
              src="/AdditionalAssets/3.png" 
              alt="Interior design sample" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="aspect-square relative rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image 
              src="/AdditionalAssets/4.png" 
              alt="Interior design sample" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="aspect-square relative rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image 
              src="/AdditionalAssets/5.png" 
              alt="Interior design sample" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="aspect-square relative rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image 
              src="/AdditionalAssets/6.png" 
              alt="Interior design sample" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
