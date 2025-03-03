"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UrlBuilder } from "@bytescale/sdk";
import { UploadWidgetConfig } from "@bytescale/upload-widget";
import { UploadDropzone } from "@bytescale/upload-widget-react";
import { CompareSlider } from "../../components/CompareSlider";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingDots from "../../components/LoadingDots";
import ResizablePanel from "../../components/ResizablePanel";
import Toggle from "../../components/Toggle";
import appendNewToName from "../../utils/appendNewToName";
import downloadPhoto from "../../utils/downloadPhoto";
import DropDown from "../../components/DropDown";
import { roomType, rooms, themeType, themes } from "../../utils/dropdownTypes";
import { toast } from "react-hot-toast";

const options: UploadWidgetConfig = {
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : "free",
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  editor: { images: { crop: false } },
  styles: {
    colors: {
      primary: "#2563EB", // Primary buttons & links
      error: "#d23f4d", // Error messages
      shade100: "#fff", // Standard text
      shade200: "#fffe", // Secondary button text
      shade300: "#fffd", // Secondary button text (hover)
      shade400: "#fffc", // Welcome text
      shade500: "#fff9", // Modal close button
      shade600: "#fff7", // Border
      shade700: "#fff2", // Progress indicator background
      shade800: "#fff1", // File item background
      shade900: "#ffff", // Various (draggable crop buttons, etc.)
    },
  },
};

export default function DreamPage() {
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false); // Состояние для отслеживания загрузки
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [theme, setTheme] = useState<themeType>("Modern");
  const [room, setRoom] = useState<roomType>("Living Room");
  const [finalUsedPrompt, setFinalUsedPrompt] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [scale, setScale] = useState<number>(7);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (uploading) {
        setUploading(false);
        toast.error("Upload took too long. Please try again.");
      }
    }, 30000); // 30 секунд таймаут

    return () => clearTimeout(timeoutId);
  }, [uploading]);

  const UploadDropZone = () => (
    <UploadDropzone
      options={options}
      onUpdate={({ uploadedFiles }) => {
        try {
          setUploading(true);
          if (uploadedFiles.length !== 0) {
            const image = uploadedFiles[0];
            const imageName = image.originalFile.originalFileName;
            const imageUrl = UrlBuilder.url({
              accountId: image.accountId,
              filePath: image.filePath,
              options: {
                transformation: "preset",
                transformationPreset: "thumbnail"
              }
            });
            setPhotoName(imageName);
            setOriginalPhoto(imageUrl);
            setUploading(false); // Загрузка завершена успешно
            toast.success("Image successfully uploaded");
            // Предотвращение автоматического запуска генерации
            setLoading(false);
            setRestoredImage(null);
          } else {
            setUploading(false);
          }
        } catch (err) {
          console.error("Error processing uploaded file:", err);
          setUploading(false);
          toast.error("An error occurred while processing the image. Please try another one.");
        }
      }}
      width="670px"
      height="250px"
    />
  );

  const generatePhoto = async (fileUrl: string, forceSeed?: boolean) => {
    try {
      setError("");
      setLoading(true);
      setRestoredImage(null);

      const res = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: fileUrl,
          theme,
          room,
          customPrompt: customPrompt || null,
          scale,
          forceSeed: forceSeed || false
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setError("Превышен лимит запросов. Пожалуйста, попробуйте позже (примерно через 24 часа).");
          // Закомментированный код для отображения дополнительной информации о лимите
          // const errorData = await res.json();
          // let errorMessage = errorData.error;
          // 
          // if (errorData.remaining !== undefined) {
          //   errorMessage += ` Осталось попыток: ${errorData.remaining}.`;
          // }
          // 
          // if (errorData.reset) {
          //   const minutes = Math.ceil(errorData.reset / 60);
          //   errorMessage += ` Попробуйте через ${minutes} минут.`;
          // }
          // 
          // setError(errorMessage);
          setLoading(false);
          return;
        }

        try {
          const errorData = await res.json();
          setError(errorData.error || `Ошибка сервера: ${res.status}`);
        } catch (jsonError) {
          const errorText = await res.text();
          setError(errorText || `Ошибка сервера: ${res.status}`);
        }
        setLoading(false);
        return;
      }

      const newPhoto = await res.json();
      console.log("Data received:", newPhoto);
      
      let imageUrl;
      
      // Check different response formats
      if (Array.isArray(newPhoto)) {
        console.log("Received array of images");
        // Take the second element of the array (index 1), which contains the final image
        imageUrl = newPhoto.length > 1 ? newPhoto[1] : newPhoto[0];
      } else if (newPhoto.image) {
        // If it's an object with an image field
        if (Array.isArray(newPhoto.image)) {
          console.log("Image field contains URL array");
          // Take the second element of the array (index 1), which contains the final image
          imageUrl = newPhoto.image.length > 1 ? newPhoto.image[1] : newPhoto.image[0];
        } else {
          imageUrl = newPhoto.image;
        }
      } else {
        console.error("Unknown response format:", newPhoto);
        setError("Unexpected server response format. Please try again.");
        setLoading(false);
        return;
      }
      
      // Check that imageUrl is now a string
      if (typeof imageUrl !== 'string') {
        console.error("imageUrl is not a string after processing:", imageUrl);
        setError("Failed to get correct image URL. Please try again.");
        setLoading(false);
        return;
      }
      
      console.log("Using image URL:", imageUrl);
      
      setRestoredImage(imageUrl);
      
      // Add timeout in case onLoadingComplete doesn't fire
      setTimeout(() => {
        if (!restoredLoaded) {
          console.log("Forcing restoredLoaded to true");
          setRestoredLoaded(true);
        }
      }, 5000);
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Could not connect to the server. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-100 sm:text-6xl mb-5">
          Create your <span className="text-amber-600">dream</span> room
        </h1>
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="flex justify-between items-center w-full flex-col mt-4">
              {!restoredImage && (
                <>
                  <div className="flex flex-row w-full justify-between space-x-8">
                    {/* Левая колонка - основные настройки */}
                    <div className="flex-1">
                      <div className="space-y-4 w-full">
                        <div className="flex mt-3 items-center space-x-3">
                          <Image
                            src="/number-1-white.svg"
                            width={30}
                            height={30}
                            alt="1 icon"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <p className="text-left font-medium text-amber-400">
                            Choose your room theme.
                          </p>
                        </div>
                        <DropDown
                          theme={theme}
                          setTheme={(newTheme) =>
                            setTheme(newTheme as typeof theme)
                          }
                          themes={themes}
                        />
                      </div>
                      <div className="space-y-4 w-full">
                        <div className="flex mt-10 items-center space-x-3">
                          <Image
                            src="/number-2-white.svg"
                            width={30}
                            height={30}
                            alt="1 icon"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <p className="text-left font-medium text-amber-400">
                            Choose your room type.
                          </p>
                        </div>
                        <DropDown
                          theme={room}
                          setTheme={(newRoom) => setRoom(newRoom as typeof room)}
                          themes={rooms}
                        />
                      </div>
                      <div className="mt-4 w-full">
                        <div className="flex mt-6 items-center space-x-3">
                          <Image
                            src="/number-3-white.svg"
                            width={30}
                            height={30}
                            alt="1 icon"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <p className="text-left font-medium text-amber-400">
                            Upload a picture of your room.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Правая колонка - расширенные настройки */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-left text-lg font-medium text-amber-400">
                          Advanced Settings
                        </h3>
                      </div>
                      
                      <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
                        <div>
                          <label className="block text-left text-sm font-medium text-amber-400 mb-2">
                            Custom Prompt
                          </label>
                          <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter your custom prompt or leave empty for automatic generation"
                            rows={3}
                          />
                          <p className="mt-1 text-xs text-gray-500 text-left">If left empty, the prompt will be generated based on selected theme and room type.</p>
                        </div>
                        
                        <div>
                          <label className="block text-left text-sm font-medium text-amber-400 mb-2">
                            Transformation Strength (Scale): {scale}
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">1</span>
                            <input
                              type="range"
                              min="1"
                              max="15"
                              value={scale}
                              onChange={(e) => setScale(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">15</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 text-left">Higher values give stronger transformations but may distort room structure.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {restoredImage && (
                <div className="text-green-500 font-medium">
                  Here's your remodeled <b>{room.toLowerCase()}</b> in the{" "}
                  <b>{theme.toLowerCase()}</b> theme!{" "}
                </div>
              )}
              <div
                className={`${
                  restoredLoaded ? "visible mt-6 -ml-8" : "invisible"
                }`}
              >
                <Toggle
                  className={`${restoredLoaded ? "visible mb-6" : "invisible"}`}
                  sideBySide={sideBySide}
                  setSideBySide={(newVal) => setSideBySide(newVal)}
                />
              </div>
              {restoredLoaded && sideBySide && originalPhoto && restoredImage && (
                <CompareSlider
                  original={originalPhoto}
                  restored={restoredImage}
                />
              )}
              
              {!originalPhoto && !uploading && <UploadDropZone />}
              
              {uploading && (
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-pulse rounded-2xl bg-gray-800 h-96 w-96 mb-4 flex items-center justify-center">
                    <p className="text-gray-400">Загрузка изображения...</p>
                  </div>
                  <button
                    disabled
                    className="bg-amber-500 rounded-full text-white font-medium px-4 pt-2 pb-3 w-40"
                  >
                    <span className="pt-4">
                      <LoadingDots color="white" style="large" />
                    </span>
                  </button>
                </div>
              )}
              
              {originalPhoto && !restoredImage && !loading && (
                <div className="mt-4">
                  <h2 className="mb-1 font-medium text-lg">Original Room</h2>
                  <Image
                    src={originalPhoto}
                    alt="original photo"
                    className="rounded-2xl relative"
                    width={475}
                    height={475}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ 
                      width: "auto", 
                      height: "auto", 
                      maxHeight: "24rem",
                      objectFit: "contain"
                    }}
                  />
                  <button
                    onClick={() => generatePhoto(originalPhoto)}
                    className="bg-amber-500 rounded-full text-white font-medium px-4 py-2 mt-4 hover:bg-amber-400 transition"
                  >
                    Generate Room
                  </button>
                </div>
              )}
              {originalPhoto && !restoredImage && loading && (
                <button
                  disabled
                  className="bg-amber-500 rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 w-40"
                >
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </button>
              )}
              {restoredImage && originalPhoto && !sideBySide && (
                <div className="flex sm:space-x-4 sm:flex-row flex-col">
                  <div>
                    <h2 className="mb-1 font-medium text-lg">Original Room</h2>
                    <Image
                      src={originalPhoto}
                      alt="original photo"
                      className="rounded-2xl relative"
                      width={475}
                      height={475}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ 
                        width: "100%", 
                        height: "auto", 
                        maxHeight: "24rem",
                        objectFit: "contain"
                      }}
                    />
                  </div>
                  <div className="sm:mt-0 mt-8">
                    <h2 className="mb-1 font-medium text-lg">Generated Room</h2>
                    {restoredImage && typeof restoredImage === 'string' ? (
                      <a href={restoredImage} target="_blank" rel="noreferrer">
                        <div>
                          <Image
                            src={restoredImage}
                            alt="restored photo"
                            className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in"
                            width={475}
                            height={475}
                            priority={true}
                            loading="eager"
                            onLoadingComplete={() => {
                              console.log("Image loaded successfully!");
                              setRestoredLoaded(true);
                            }}
                            onError={(e) => {
                              console.error("Error loading image:", e);
                              setError("Failed to load the generated image. Please try again.");
                            }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ 
                              width: "100%", 
                              height: "auto", 
                              maxHeight: "24rem",
                              objectFit: "contain"
                            }}
                          />
                        </div>
                      </a>
                    ) : (
                      <div 
                        className="rounded-2xl relative bg-gray-800 flex items-center justify-center" 
                        style={{ width: "100%", height: "24rem" }}
                      >
                        <p className="text-gray-400">Picture is loading...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {restoredImage && finalUsedPrompt && (
                <div className="mt-4 p-4 bg-gray-800 rounded-xl max-w-3xl text-left">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-white">Prompt used for generation:</h3>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(finalUsedPrompt);
                        toast.success("Prompt copied to clipboard!");
                      }}
                      className="text-sm bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">{finalUsedPrompt}</p>
                </div>
              )}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div className="flex space-x-2 justify-center mt-16">
                <button
                  onClick={() => {
                    setOriginalPhoto(null);
                    setRestoredImage(null);
                    setRestoredLoaded(false);
                    setError(null);
                    setLoading(false);
                    setCustomPrompt(""); // Clear custom prompt
                  }}
                  className="bg-amber-500 rounded-full text-white font-medium px-4 py-2 hover:bg-amber-400 transition"
                >
                  Generate Another Room
                </button>
                {restoredImage && (
                  <>
                    <button
                      onClick={() => {
                        downloadPhoto(restoredImage!, appendNewToName(photoName!));
                      }}
                      className="bg-gray-700 rounded-full text-white font-medium px-4 py-2 hover:bg-gray-600 transition"
                    >
                      Download Result
                    </button>
                    <button
                      onClick={() => {
                        // Use the same originalPhoto but with forceSeed flag for a new seed
                        if (originalPhoto) {
                          generatePhoto(originalPhoto, true);
                        }
                      }}
                      className="bg-blue-500 rounded-full text-white font-medium px-4 py-2 hover:bg-blue-400 transition"
                    >
                      New Variation
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
}
