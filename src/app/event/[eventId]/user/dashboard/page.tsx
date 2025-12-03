// "use client";
// import { useRouter } from "next/navigation";
// import { useParams } from "next/navigation";
// import { useState, useEffect } from "react";
// import {
//   SandpackProvider,
//   SandpackLayout,
//   SandpackFileExplorer,
//   SandpackCodeEditor,
//   SandpackPreview,
// } from "@codesandbox/sandpack-react";
// import { nightOwl } from "@codesandbox/sandpack-themes";
// import { useUploadStore } from "@/hooks/useStore";
// import { Loader2Icon } from "lucide-react";
// import { Resizable } from "react-resizable";
// import "react-resizable/css/styles.css";

// type SandpackFiles = Record<string, { code: string; hidden?: boolean }>;

// // List of files/directories to exclude
// const EXCLUDED_PATHS = [
//   "node_modules",
//   ".git",
//   ".gitignore",
//   ".DS_Store",
//   "package-lock.json",
//   "yarn.lock",
//   "dist",
//   "build",
//   ".next",
//   ".vscode",
//   "Thumbs.db",
//   ".env",
//   ".env.local",
//   ".idea",
// ];

// const Page = () => {
//   const router = useRouter();
//   const { files } = useUploadStore();
//   const { eventId } = useParams<{ eventId: string }>();
//   const [sandpackFiles, setSandpackFiles] = useState<SandpackFiles>(
//     {} as SandpackFiles
//   );
//   const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
//   const [isLoading, setIsLoading] = useState(false);
//   const [explorerWidth, setExplorerWidth] = useState(300); // Initial width for file explorer

//   const handleTabChange = (tab: "code" | "preview") => {
//     setActiveTab(tab);
//   };

//   const shouldExcludeFile = (filePath: string): boolean => {
//     const lowerCasePath = filePath.toLowerCase();
//     return EXCLUDED_PATHS.some(
//       (excludedPath) =>
//         lowerCasePath.includes(excludedPath.toLowerCase()) ||
//         lowerCasePath.startsWith(`/${excludedPath.toLowerCase()}`)
//     );
//   };

//   useEffect(() => {
//     const processFiles = async () => {
//       console.log("!files");
//       if (!files || files.length === 0) {
//         router.push(`/event/${eventId}/user/upload`);
//         // return;
//       }

//       setIsLoading(true);
//       const filesObj: SandpackFiles = {} as SandpackFiles;

//       await Promise.all(
//         Array.from(files).map(async (file) => {
//           const fullPath = file.webkitRelativePath || file.name;
//           const cleanPath = "/" + fullPath.split("/").slice(1).join("/");

//           if (shouldExcludeFile(cleanPath)) return;

//           if (
//             file.type &&
//             !file.type.startsWith("text/") &&
//             !file.name.match(/\.(js|jsx|ts|tsx|css|scss|html|json|md|txt)$/i)
//           ) {
//             return;
//           }

//           try {
//             filesObj[cleanPath] = {
//               code: await file.text(),
//               hidden: false,
//             };
//           } catch (error) {
//             console.warn(`Could not read file ${cleanPath}:`, error);
//           }
//         })
//       );

//       setSandpackFiles(filesObj);
//       setIsLoading(false);
//     };

//     processFiles();
//   }, [files]);

//   const getEntryFile = (): string => {
//     if (Object.keys(sandpackFiles).length === 0) return "/App.js";

//     const possibleEntryPoints = [
//       "/src/main.jsx",
//       "/src/main.tsx",
//       "/src/App.jsx",
//       "/src/App.tsx",
//       "/App.jsx",
//       "/App.tsx",
//       "/index.js",
//       "/index.tsx",
//     ];

//     const foundEntry = possibleEntryPoints.find((path) => sandpackFiles[path]);
//     return foundEntry || Object.keys(sandpackFiles)[0];
//   };

//   const handleResize = (
//     event: React.SyntheticEvent,
//     { size }: { size: { width: number; height: number } }
//   ) => {
//     setExplorerWidth(size.width);
//   };

//   return (
//     <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-gray-900 font-sans">
//       {/* Sticky Tab Navigation */}
//       <div className="sticky top-0 z-10 bg-gray-800 p-3 shadow-md">
//         <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg w-fit">
//           {(["code", "preview"] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => handleTabChange(tab)}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
//                 activeTab === tab
//                   ? "bg-blue-600 text-white shadow-sm"
//                   : "text-gray-300 hover:bg-gray-700 hover:text-white"
//               }`}
//               aria-label={`Switch to ${tab} view`}
//               aria-selected={activeTab === tab}
//               role="tab"
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Main Content */}
//       {Object.keys(sandpackFiles).length > 0 ? (
//         <SandpackProvider
//           files={sandpackFiles}
//           template="react-ts"
//           theme={nightOwl}
//           customSetup={{
//             entry: getEntryFile(),
//           }}
//           options={{
//             externalResources: ["https://cdn.tailwindcss.com"],
//             classes: {
//               "sp-layout": "h-[calc(100vh-4rem)]",
//             },
//             activeFile: Object.keys(sandpackFiles)[0],
//           }}
//         >
//           <SandpackLayout>
//             {activeTab === "code" ? (
//               <div className="flex h-full">
//                 <Resizable
//                   width={explorerWidth}
//                   height={Infinity}
//                   onResize={handleResize}
//                   minConstraints={[200, Infinity]}
//                   maxConstraints={[500, Infinity]}
//                   className="border-r border-gray-700"
//                   handle={
//                     <div className="w-1 bg-gray-600 hover:bg-blue-500 cursor-col-resize" />
//                   }
//                 >
//                   <div
//                     className="p-2 bg-gray-800"
//                     style={{ width: explorerWidth, height: "100%" }}
//                   >
//                     <input
//                       type="text"
//                       placeholder="Search files..."
//                       className="w-full mb-2 p-2 text-sm bg-gray-900 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <SandpackFileExplorer
//                       autoHiddenFiles={false}
//                       style={{ height: "calc(100% - 40px)" }}
//                     />
//                   </div>
//                 </Resizable>
//                 <div className="flex-1">
//                   <SandpackCodeEditor
//                     showLineNumbers
//                     showTabs
//                     closableTabs
//                     style={{ height: "100%" }}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="w-full h-full bg-gray-800">
//                 <div className="flex items-center p-2 bg-gray-900 border-b border-gray-700">
//                   <button
//                     className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                     onClick={() => window.location.reload()}
//                     aria-label="Refresh preview"
//                   >
//                     Refresh
//                   </button>
//                 </div>
//                 <SandpackPreview
//                   showNavigator
//                   style={{ height: "calc(100% - 44px)", width: "100%" }}
//                 />
//               </div>
//             )}
//           </SandpackLayout>
//         </SandpackProvider>
//       ) : (
//         <div className="flex items-center justify-center h-full bg-gray-900">
//           {isLoading ? (
//             <div className="flex flex-col items-center gap-4">
//               <Loader2Icon className="animate-spin w-12 h-12 text-blue-500" />
//               <p className="text-white text-lg">Processing your files...</p>
//             </div>
//           ) : (
//             <div className="text-center">
//               <p className="text-gray-300 text-lg mb-4">
//                 No files uploaded yet
//               </p>
//               <button
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                 onClick={() => router.back()} // Adjust route as needed
//                 aria-label="Go Back to Upload Files Page"
//               >
//                 Upload Files
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Page;

"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackFileExplorer,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { useUploadStore, useUserDetails } from "@/hooks/useStore";
import { unzipFromUrl } from "@/libs/unzip-utils";
import axios from "axios";
import { motion } from "framer-motion";
import { Code2, Eye, Globe, RefreshCw, Search } from "lucide-react";
import { ArrowLeft, TerminalSquare } from "lucide-react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

type SandpackFiles = Record<string, { code: string; hidden?: boolean }>;

const zincTheme = {
  colors: {
    // Surface colors
    surface1: "#09090b", // zinc-950
    surface2: "#18181b", // zinc-900
    surface3: "#27272a", // zinc-800

    // Text colors
    base: "#fafafa", // zinc-50
    disabled: "#71717a", // zinc-500
    hover: "#ffffff",

    // Border and accent
    accent: "#8b5cf6", // violet-500
    border: "#3f3f46", // zinc-700

    // UI elements
    clickable: "#a1a1aa", // zinc-400
    icon: "#a1a1aa", // zinc-400
  },
  syntax: {
    keyword: "#c084fc", // violet-400
    property: "#38bdf8", // sky-400
    plain: "#fafafa", // zinc-50
    static: "#fb7185", // rose-400
    string: "#4ade80", // green-400
    definition: "#e879f9", // fuchsia-400
    punctuation: "#fafafa", // zinc-50
    tag: "#38bdf8", // sky-400
    comment: "#71717a", // zinc-500
  },
  font: {
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
    size: "13px",
    lineHeight: "20px",
  },
};
// List of files/directories to exclude
const EXCLUDED_PATHS = [
  "node_modules",
  ".git",
  ".gitignore",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
  "dist",
  "build",
  ".next",
  ".vscode",
  "Thumbs.db",
  ".env",
  ".env.local",
  ".idea",
];

// Helper function to get entry file from files object
const getEntryFileFromFiles = (files: SandpackFiles): string => {
  // Priority order: main entry points first, then App components
  const possibleEntryPoints = [
    "/src/main.tsx",
    "/src/main.jsx",
    "/src/index.tsx",
    "/src/index.jsx",
    "/src/main.ts",
    "/src/main.js",
    "/src/index.ts",
    "/src/index.js",
    "/index.tsx",
    "/index.jsx",
    "/index.ts",
    "/index.js",
  ];

  // First, try to find a main/index entry point
  let foundEntry = possibleEntryPoints.find((path) => files[path]);
  
  // If no main/index found, look for App components (but prioritize src/App over root App)
  if (!foundEntry) {
    const appEntryPoints = [
      "/src/App.tsx",
      "/src/App.jsx",
      "/src/App.ts",
      "/src/App.js",
      "/App.tsx",
      "/App.jsx",
      "/App.ts",
      "/App.js",
    ];
    foundEntry = appEntryPoints.find((path) => files[path]);
  }
  
  // Final fallback: use first file that looks like an entry point
  if (!foundEntry) {
    const allFiles = Object.keys(files);
    foundEntry = allFiles.find(path => 
      path.match(/\/(main|index|App)\.(tsx|jsx|ts|js)$/i) &&
      !path.includes('node_modules') &&
      !path.includes('.test.') &&
      !path.includes('.spec.')
    );
  }
  
  return foundEntry || "/src/main.tsx";
};

const Page = () => {
  const router = useRouter();
  const { files } = useUploadStore();
  const { user } = useUserDetails();
  const { eventId } = useParams<{ eventId: string }>();
  const [sandpackFiles, setSandpackFiles] = useState<SandpackFiles>(
    {} as SandpackFiles
  );
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isLoading, setIsLoading] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(300); // Initial width for file explorer
  console.log(isLoading);
  // const handleTabChange = (tab: "code" | "preview") => {
  //   setActiveTab(tab);
  // };

  const shouldExcludeFile = (filePath: string): boolean => {
    const lowerCasePath = filePath.toLowerCase();
    // More precise matching - check if path contains excluded paths as directories/files
    return EXCLUDED_PATHS.some((excludedPath) => {
      const lowerExcluded = excludedPath.toLowerCase();
      // Match if path contains the excluded path as a directory segment
      // e.g., "/node_modules/..." or "/src/node_modules/..." but not "/src/modules/..."
      return (
        lowerCasePath.includes(`/${lowerExcluded}/`) ||
        lowerCasePath.startsWith(`/${lowerExcluded}/`) ||
        lowerCasePath.endsWith(`/${lowerExcluded}`) ||
        lowerCasePath === `/${lowerExcluded}` ||
        // For files like .gitignore, .DS_Store - match exact filename
        lowerCasePath.endsWith(`/${lowerExcluded}`) ||
        lowerCasePath === lowerExcluded
      );
    });
  };

  useEffect(() => {
    const processFiles = async () => {
      setIsLoading(true);
      const filesObj: SandpackFiles = {} as SandpackFiles;
      let unzippedFiles: Record<string, string> | null = null;

      // Always try to fetch from team storage first (for zip files)
      // Option 1: Fetch zip from team's storageUrl and unzip it
      try {
        console.log("Fetching from team storage...");
        if (!user || !eventId) {
          // If no user/eventId, try to use files from store as fallback
          if (files && files.length > 0) {
            console.log("No user/eventId, using files from upload store:", files.length);
            // Process files from store (folder upload)
            await Promise.all(
              Array.from(files).map(async (file) => {
                const fullPath = file.webkitRelativePath || file.name;
                const cleanPath = "/" + fullPath.split("/").slice(1).join("/");

                if (shouldExcludeFile(cleanPath)) return;

                if (
                  file.type &&
                  !file.type.startsWith("text/") &&
                  !file.name.match(/\.(js|jsx|ts|tsx|css|scss|html|json|md|txt)$/i)
                ) {
                  return;
                }

                try {
                  filesObj[cleanPath] = {
                    code: await file.text(),
                    hidden: false,
                  };
                } catch (error) {
                  console.warn(`Could not read file ${cleanPath}:`, error);
                }
              })
            );
          } else {
        router.push(`/event/${eventId}/user/upload`);
            return;
          }
        } else {
          // Fetch team data to get storageUrl
          const res = await axios.get(
            `/api/users/getTeam?eventId=${eventId}&userId=${user.id}`
          );
          const teamData = res.data.team || res.data;
          const storageUrl = teamData?.storageUrl;
          
          console.log("Team data:", teamData);
          console.log("Storage URL:", storageUrl);

          if (storageUrl) {
            console.log("✓ Found storage URL, unzipping:", storageUrl);
            try {
              console.log("Calling unzipFromUrl...");
              unzippedFiles = await unzipFromUrl(storageUrl);
              console.log("✓ Unzip successful! Files extracted:", Object.keys(unzippedFiles).length);
              console.log("Unzipped file paths:", Object.keys(unzippedFiles).slice(0, 10));
              
              if (Object.keys(unzippedFiles).length === 0) {
                console.error("✗ No files extracted from zip!");
                throw new Error("Zip file is empty or contains no extractable files");
              }
            } catch (zipError) {
              console.error("✗ Failed to unzip file:", zipError);
              console.error("Error details:", zipError instanceof Error ? zipError.stack : zipError);
              // If unzip fails, try to use files from store as fallback
              if (files && files.length > 0) {
                console.log("Unzip failed, falling back to files from upload store");
      await Promise.all(
        Array.from(files).map(async (file) => {
          const fullPath = file.webkitRelativePath || file.name;
          const cleanPath = "/" + fullPath.split("/").slice(1).join("/");

          if (shouldExcludeFile(cleanPath)) return;

          if (
            file.type &&
            !file.type.startsWith("text/") &&
            !file.name.match(/\.(js|jsx|ts|tsx|css|scss|html|json|md|txt)$/i)
          ) {
            return;
          }

          try {
            filesObj[cleanPath] = {
              code: await file.text(),
              hidden: false,
            };
          } catch (error) {
            console.warn(`Could not read file ${cleanPath}:`, error);
          }
        })
      );
              } else {
                alert(`Failed to extract files from zip: ${zipError instanceof Error ? zipError.message : 'Unknown error'}. Please try uploading again.`);
                setIsLoading(false);
                return;
              }
            }
          } else {
            console.log("No storage URL found");
            // No storage URL - try files from store
            if (files && files.length > 0) {
              console.log("Using files from upload store:", files.length);
              await Promise.all(
                Array.from(files).map(async (file) => {
                  const fullPath = file.webkitRelativePath || file.name;
                  const cleanPath = "/" + fullPath.split("/").slice(1).join("/");

                  if (shouldExcludeFile(cleanPath)) return;

                  if (
                    file.type &&
                    !file.type.startsWith("text/") &&
                    !file.name.match(/\.(js|jsx|ts|tsx|css|scss|html|json|md|txt)$/i)
                  ) {
                    return;
                  }

                  try {
                    filesObj[cleanPath] = {
                      code: await file.text(),
                      hidden: false,
                    };
                  } catch (error) {
                    console.warn(`Could not read file ${cleanPath}:`, error);
                  }
                })
              );
            } else {
              console.log("No storage URL and no files in store, redirecting to upload");
              router.push(`/event/${eventId}/user/upload`);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
        // Fallback to files from store if available
        if (files && files.length > 0) {
          console.log("Error fetching team, using files from upload store");
          await Promise.all(
            Array.from(files).map(async (file) => {
              const fullPath = file.webkitRelativePath || file.name;
              const cleanPath = "/" + fullPath.split("/").slice(1).join("/");

              if (shouldExcludeFile(cleanPath)) return;

              if (
                file.type &&
                !file.type.startsWith("text/") &&
                !file.name.match(/\.(js|jsx|ts|tsx|css|scss|html|json|md|txt)$/i)
              ) {
                return;
              }

              try {
                filesObj[cleanPath] = {
                  code: await file.text(),
                  hidden: false,
                };
              } catch (error) {
                console.warn(`Could not read file ${cleanPath}:`, error);
              }
            })
          );
        } else {
          router.push(`/event/${eventId}/user/upload`);
          return;
        }
      }

      // Process unzipped files if we have them (from zip upload)
      if (unzippedFiles && Object.keys(unzippedFiles).length > 0) {
        try {
          console.log("=== FILE PROCESSING START ===");
          console.log("Processing unzipped files from zip...");
          console.log("Total files extracted from zip:", Object.keys(unzippedFiles).length);
          console.log("Sample file paths (first 20):", Object.keys(unzippedFiles).slice(0, 20));
          
          let processedCount = 0;
          let excludedCount = 0;
          let skippedCount = 0;
          
          for (const [filePath, content] of Object.entries(unzippedFiles)) {
            // Normalize path - zip.js returns paths without leading slash
            // Handle both "path/to/file.js" and "/path/to/file.js"
            let cleanPath = filePath.startsWith("/") ? filePath : filePath;
            
            // Remove any leading folder name (common in zip files from GitHub)
            // GitHub zips often have: "repo-name-main/src/App.js" or "repo-name/src/App.js"
            // We want: "/src/App.js"
            const pathParts = cleanPath.split("/").filter(p => p.length > 0);
            
            // Skip if path is too short or is just a folder name
            if (pathParts.length === 0) {
              skippedCount++;
              console.log(`Skipping empty path: ${filePath}`);
              continue;
            }
            
            // Detect and remove GitHub-style root folder (e.g., "react-calculator-main", "react-calculator")
            // The root folder typically:
            // 1. Is the first path part
            // 2. Doesn't contain a dot (no file extension)
            // 3. When removed, leaves at least one more path part
            if (pathParts.length > 1) {
              const firstPart = pathParts[0];
              const hasExtension = firstPart.includes('.');
              
              // If first part looks like a folder name (no extension), remove it
              // This handles: "react-calculator/src/App.js" -> "/src/App.js"
              if (!hasExtension) {
                const withoutRoot = pathParts.slice(1);
                if (withoutRoot.length > 0) {
                  cleanPath = "/" + withoutRoot.join("/");
                } else {
                  // This shouldn't happen, but handle it
                  cleanPath = "/" + pathParts.join("/");
                }
              } else {
                // First part has extension, so it's a file at root - keep it
                cleanPath = "/" + pathParts.join("/");
              }
            } else {
              // Single path part - could be root file or folder
              // If it has extension, it's a file - keep it
              if (pathParts[0].includes('.')) {
                cleanPath = "/" + pathParts[0];
              } else {
                // Single folder name - skip
                skippedCount++;
                console.log(`Skipping single folder: ${filePath}`);
                continue;
              }
            }

            if (shouldExcludeFile(cleanPath)) {
              excludedCount++;
              console.log(`Excluding file: ${cleanPath} (original: ${filePath})`);
              continue;
            }

            // Only include text-based files (check cleanPath, not filePath)
            // Added more extensions: sass, xml, svg
            const hasValidExtension = cleanPath.match(/\.(js|jsx|ts|tsx|css|scss|sass|html|json|md|txt|vue|svelte|py|java|cpp|c|h|hpp|xml|svg)$/i);
            if (!hasValidExtension) {
              skippedCount++;
              // Only log first few skipped files to avoid console spam
              if (skippedCount <= 5) {
                console.log(`Skipping non-text file: ${cleanPath} (original: ${filePath})`);
              }
              continue;
            }
            
            // Log first few processed files for debugging
            if (processedCount < 5) {
              console.log(`Processing file: ${cleanPath} (original: ${filePath})`);
            }

            try {
              let fileContent: string;
              if (typeof content === "string") {
                fileContent = content;
              } else {
                // Handle Blob or ArrayBuffer
                const blob = content as unknown;
                if (blob && typeof blob === "object" && "text" in blob && typeof (blob as Blob).text === "function") {
                  fileContent = await (blob as Blob).text();
                } else if (blob && typeof blob === "object" && "byteLength" in blob) {
                  fileContent = new TextDecoder().decode(new Uint8Array(blob as ArrayBuffer));
                } else {
                  fileContent = String(content || "");
                }
              }
              
              // Don't skip empty files - they might be intentionally empty or have minimal content
              // Just ensure we have a string
              if (fileContent === undefined || fileContent === null) {
                console.warn(`Skipping file with null/undefined content: ${cleanPath}`);
                skippedCount++;
                continue;
              }
              
              filesObj[cleanPath] = {
                code: fileContent || "",
                hidden: false,
              };
              processedCount++;
              if (processedCount <= 5) {
                console.log(`✓ Processed: ${cleanPath} (${fileContent.length} chars)`);
              }
            } catch (error) {
              skippedCount++;
              console.warn(`Could not process file ${cleanPath} (original: ${filePath}):`, error);
            }
          }
          
          console.log(`=== FILE PROCESSING SUMMARY ===`);
          console.log(`Processed: ${processedCount}, Excluded: ${excludedCount}, Skipped: ${skippedCount}`);
          console.log(`Total files in zip: ${unzippedFiles ? Object.keys(unzippedFiles).length : 'N/A'}`);
          console.log(`Files added to sandpack: ${Object.keys(filesObj).length}`);
          
          // If no files were processed, log all original paths for debugging
          if (processedCount === 0 && unzippedFiles && Object.keys(unzippedFiles).length > 0) {
            console.error("=== ERROR: No files were processed! ===");
            console.error("Original file paths from zip (first 50):");
            Object.keys(unzippedFiles).slice(0, 50).forEach((path, idx) => {
              console.error(`  ${idx + 1}. "${path}"`);
            });
            console.error("Possible reasons:");
            console.error("1. Files don't have valid extensions (.js, .jsx, .ts, .tsx, .css, .html, etc.)");
            console.error("2. Files are being excluded by shouldExcludeFile()");
            console.error("3. Path normalization is removing all files");
          }
          console.log("Files:", Object.keys(filesObj));

          console.log(`Files after processing: ${Object.keys(filesObj).length}`);
          
          // Only create helper files if we have actual project files
          if (Object.keys(filesObj).length > 0) {
          // Collect all CSS files first and ensure they're in /src/ for imports
          const cssFiles = Object.keys(filesObj).filter(path => path.match(/\.css$/i));
          
          // Copy root-level CSS files to /src/ for easier imports
          cssFiles.forEach(cssPath => {
            if (!cssPath.startsWith('/src/')) {
              const cssFileName = cssPath.split('/').pop() || 'styles.css';
              const srcCssPath = `/src/${cssFileName}`;
              if (!filesObj[srcCssPath]) {
                filesObj[srcCssPath] = {
                  code: filesObj[cssPath].code,
                  hidden: false,
                };
                console.log(`Copied CSS file from ${cssPath} to ${srcCssPath}`);
              }
            }
          });
          
          // Ensure package.json exists with proper dependencies
          if (!filesObj["/package.json"]) {
            filesObj["/package.json"] = {
              code: JSON.stringify({
                name: "sandpack-project",
                version: "1.0.0",
                dependencies: {
                  react: "^18.2.0",
                  "react-dom": "^18.2.0",
                },
              }, null, 2),
              hidden: false,
            };
          } else {
            // Update existing package.json to ensure React dependencies
            try {
              const pkgJson = JSON.parse(filesObj["/package.json"].code);
              if (!pkgJson.dependencies) {
                pkgJson.dependencies = {};
              }
              if (!pkgJson.dependencies.react) {
                pkgJson.dependencies.react = "^18.2.0";
              }
              if (!pkgJson.dependencies["react-dom"]) {
                pkgJson.dependencies["react-dom"] = "^18.2.0";
              }
              filesObj["/package.json"] = {
                code: JSON.stringify(pkgJson, null, 2),
                hidden: false,
              };
            } catch (e) {
              console.warn("Could not parse package.json, creating new one");
              filesObj["/package.json"] = {
                code: JSON.stringify({
                  name: "sandpack-project",
                  version: "1.0.0",
                  dependencies: {
                    react: "^18.2.0",
                    "react-dom": "^18.2.0",
                  },
                }, null, 2),
                hidden: false,
              };
            }
          }
          
          // Generate CSS links for HTML head (use all CSS files, prefer /src/ versions)
          const allCssFiles = Object.keys(filesObj).filter(path => path.match(/\.css$/i));
          const cssLinks = allCssFiles.map(cssPath => {
            const relativePath = cssPath.startsWith('/') ? cssPath : `/${cssPath}`;
            return `    <link rel="stylesheet" href="${relativePath}">`;
          }).join('\n');
          
          
          // Ensure we have an index.html for Sandpack
          if (!filesObj["/index.html"]) {
            filesObj["/index.html"] = {
              code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Preview</title>
  ${cssLinks}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      background: transparent !important;
      margin: 0;
      padding: 0;
    }
    #root {
      width: 100%;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent !important;
    }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
              hidden: false,
            };
          } else {
            // Update existing index.html to include CSS links and transparent background
            let htmlContent = filesObj["/index.html"].code;
            
            // Inject transparent background styles
            const transparentStyles = `
    <style>
      html, body {
        background: transparent !important;
        margin: 0;
        padding: 0;
      }
      #root {
        background: transparent !important;
      }
      body > * {
        background: transparent !important;
      }
    </style>`;
            
            // Add CSS links if not present
            if (!htmlContent.includes('<link rel="stylesheet"') && cssLinks) {
              htmlContent = htmlContent.replace('</head>', `    ${cssLinks}\n  </head>`);
            }
            
            // Inject transparent background styles before closing </head>
            if (!htmlContent.includes('background: transparent')) {
              htmlContent = htmlContent.replace('</head>', `    ${transparentStyles}\n  </head>`);
            }
            
            filesObj["/index.html"] = {
              code: htmlContent,
              hidden: false,
            };
          }
          
          // Ensure App.tsx has a default export if it exists
          const appFile = Object.keys(filesObj).find(path => 
            path.match(/\/App\.(tsx|jsx|ts|js)$/i)
          );
          if (appFile) {
            let appContent = filesObj[appFile].code;
            // Check if it has default export
            if (!appContent.includes('export default') && !appContent.match(/export\s+default\s+/)) {
              // Try to add default export
              if (appContent.includes('export function App') || appContent.includes('export const App')) {
                appContent = appContent.replace(/export\s+(function|const)\s+App/, 'export default function App');
                filesObj[appFile] = { code: appContent, hidden: false };
                console.log(`Added default export to ${appFile}`);
              } else if (appContent.includes('function App') || appContent.includes('const App')) {
                // Add export default before the declaration
                appContent = appContent.replace(/(function|const)\s+App/, 'export default function App');
                filesObj[appFile] = { code: appContent, hidden: false };
                console.log(`Added default export to ${appFile}`);
              }
            }
          }

            // Ensure we have a main entry point if missing
            const hasMainEntry = Object.keys(filesObj).some(path => 
              path.match(/\/src\/(main|index)\.(tsx|jsx|ts|js)$/i)
            );
            
            if (!hasMainEntry) {
              // Find the first App component or create a main entry
              const appFile = Object.keys(filesObj).find(path => 
                path.match(/\/App\.(tsx|jsx|ts|js)$/i)
              );
              
              if (appFile) {
                const appPath = appFile.startsWith("/") ? appFile : `/${appFile}`;
                // Calculate relative path from /src/main.tsx to the App file
                let importPath = appPath.replace(/\.(tsx|jsx|ts|js)$/i, '');
                if (importPath.startsWith("/src/")) {
                  importPath = importPath.replace("/src/", "./");
                } else if (importPath.startsWith("/")) {
                  importPath = `..${importPath}`;
                }
                
                // Check if App file has default export and ensure it does
                let appContent = filesObj[appFile]?.code || '';
                let hasDefaultExport = appContent.includes('export default') || 
                                       appContent.match(/export\s+default\s+/);
                
                // If no default export, try to add one
                if (!hasDefaultExport && appContent.includes('export')) {
                  // Try to extract the component name and add default export
                  const componentMatch = appContent.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/);
                  if (componentMatch) {
                    const componentName = componentMatch[1];
                    appContent += `\nexport default ${componentName};`;
                    filesObj[appFile] = { code: appContent, hidden: false };
                    hasDefaultExport = true;
                  }
                }
                
                filesObj["/src/main.tsx"] = {
                  code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '${importPath}';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(React.createElement(App));`,
                  hidden: false,
                };
                console.log(`Created main.tsx entry point using App file: ${appFile}`);
            } else {
              // Try to find any React component file that exports a component
              const reactFiles = Object.keys(filesObj).filter(path => 
                path.match(/\.(tsx|jsx)$/i) && 
                !path.includes('node_modules') &&
                !path.includes('main.') &&
                !path.includes('index.')
              );
              
              // Check which files have component exports
              let componentFile: string | undefined;
              for (const file of reactFiles) {
                const content = filesObj[file]?.code || '';
                if (content.includes('export default') || 
                    content.match(/export\s+default\s+(function|const|class)/) ||
                    content.includes('export default function') ||
                    content.includes('export default class')) {
                  componentFile = file;
                  break;
                }
              }
              
              if (!componentFile && reactFiles.length > 0) {
                // Use first React file as fallback
                componentFile = reactFiles[0];
              }
              
              if (componentFile) {
                const filePath = componentFile.startsWith("/") ? componentFile : `/${componentFile}`;
                let importPath = filePath.replace(/\.(tsx|jsx)$/i, '');
                if (importPath.startsWith("/src/")) {
                  importPath = importPath.replace("/src/", "./");
                } else if (importPath.startsWith("/")) {
                  importPath = `..${importPath}`;
                }
                
                const fileContent = filesObj[componentFile]?.code || '';
                const hasDefaultExport = fileContent.includes('export default');
                
                filesObj["/src/main.tsx"] = {
                  code: `import React from 'react';
import { createRoot } from 'react-dom/client';
${hasDefaultExport 
  ? `import Component from '${importPath}';` 
  : `import * as ComponentModule from '${importPath}';`}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
${hasDefaultExport
  ? `if (Component && typeof Component === 'function') {
  root.render(React.createElement(Component));
} else {
  root.render(React.createElement('div', null, 'Error: Component is not a valid React component'));
}`
  : `const Component = ComponentModule.default || ComponentModule;
if (Component && typeof Component === 'function') {
  root.render(React.createElement(Component));
} else {
  root.render(React.createElement('div', null, 'Error: Component not found or not exported correctly.'));
}`}`,
                  hidden: false,
                };
                console.log(`Created main.tsx entry point using: ${componentFile}`);
              } else {
                // Check if there's an HTML file or JS file we can use
                const htmlFile = Object.keys(filesObj).find(path => path.match(/\.html$/i) && path !== '/index.html');
                const jsFile = Object.keys(filesObj).find(path => path.match(/\.js$/i) && !path.includes('node_modules'));
                // cssFile is not used but kept for potential future use
                // const cssFile = Object.keys(filesObj).find(path => path.match(/\.css$/i));
                
                // Create App component that can handle HTML/JS projects
                console.log("No React component found, creating wrapper App");
                
                const fileCount = Object.keys(filesObj).length;
                const jsFileCode = jsFile ? filesObj[jsFile]?.code || '' : '';
                const htmlFileCode = htmlFile ? filesObj[htmlFile]?.code || '' : '';
                
                // Build App component code
                let appCode = "import React, { useEffect, useRef } from 'react';\n";
                // Import all CSS files - prefer /src/ versions
                const allCssFiles = Object.keys(filesObj).filter(path => path.match(/\.css$/i));
                const cssFilesToImport = allCssFiles.filter(path => path.startsWith('/src/'));
                // If no CSS in /src/, use root level CSS
                const cssFilesForImport = cssFilesToImport.length > 0 ? cssFilesToImport : allCssFiles;
                
                cssFilesForImport.forEach(cssPath => {
                  let relativePath: string;
                  if (cssPath.startsWith('/src/')) {
                    relativePath = `./${cssPath.replace('/src/', '')}`;
                  } else {
                    // Root level CSS - use absolute path or copy to src
                    const cssFileName = cssPath.split('/').pop() || 'styles.css';
                    relativePath = `./${cssFileName}`;
                    // Ensure it exists in src
                    if (!filesObj[`/src/${cssFileName}`]) {
                      filesObj[`/src/${cssFileName}`] = {
                        code: filesObj[cssPath].code,
                        hidden: false,
                      };
                    }
                  }
                  appCode += `import '${relativePath}';\n`;
                  console.log(`Importing CSS: ${relativePath} from ${cssPath}`);
                });
                
                appCode += "\nexport default function App() {\n";
                appCode += "  const containerRef = useRef<HTMLDivElement>(null);\n\n";
                
                // Inject CSS directly into the component if needed
                if (cssFilesForImport.length > 0) {
                  appCode += "  useEffect(() => {\n";
                  appCode += "    // Inject CSS styles directly\n";
                  appCode += "    const styleElements: HTMLStyleElement[] = [];\n";
                  cssFilesForImport.forEach((cssPath, index) => {
                    const cssContent = filesObj[cssPath]?.code || '';
                    if (cssContent) {
                      appCode += `    const style${index} = document.createElement('style');\n`;
                      appCode += `    style${index}.textContent = ${JSON.stringify(cssContent)};\n`;
                      appCode += `    document.head.appendChild(style${index});\n`;
                      appCode += `    styleElements.push(style${index});\n`;
                    }
                  });
                  appCode += "    return () => {\n";
                  appCode += "      styleElements.forEach(style => {\n";
                  appCode += "        if (style.parentNode) style.parentNode.removeChild(style);\n";
                  appCode += "      });\n";
                  appCode += "    };\n";
                  appCode += "  }, []);\n\n";
                }
                
                if (jsFile) {
                // Inject global CSS override to remove all backgrounds
                appCode += "  useEffect(() => {\n";
                appCode += "    // Remove all backgrounds from body and html\n";
                appCode += "    const style = document.createElement('style');\n";
                appCode += "    style.textContent = `\n";
                appCode += "      html, body { background: transparent !important; }\n";
                appCode += "      body > * { background: transparent !important; }\n";
                appCode += "      #root { background: transparent !important; }\n";
                appCode += "      * { background-color: transparent !important; }\n";
                appCode += "    `;\n";
                appCode += "    document.head.appendChild(style);\n";
                appCode += "    return () => { if (style.parentNode) style.parentNode.removeChild(style); };\n";
                appCode += "  }, []);\n\n";
                
                appCode += "  useEffect(() => {\n";
                appCode += "    if (containerRef.current) {\n";
                appCode += "      try {\n";
                appCode += `        const scriptContent = ${JSON.stringify(jsFileCode)};\n`;
                appCode += "        if (scriptContent) {\n";
                appCode += "          const script = document.createElement('script');\n";
                appCode += "          script.textContent = scriptContent;\n";
                appCode += "          containerRef.current.appendChild(script);\n";
                appCode += "        }\n";
                appCode += "      } catch (error) {\n";
                appCode += "        console.error('Error executing script:', error);\n";
                appCode += "      }\n";
                appCode += "    }\n";
                appCode += "  }, []);\n\n";
                }
                
                if (htmlFile) {
                  const bodyMatch = htmlFileCode.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                  const htmlContent = bodyMatch ? bodyMatch[1] : htmlFileCode.replace(/<[^>]+>/g, '');
                  appCode += `  const htmlContent = ${JSON.stringify(htmlContent)};\n\n`;
                }
                
                appCode += "  return (\n";
                appCode += "    <div\n";
                appCode += "      ref={containerRef}\n";
                appCode += "      style={{\n";
                appCode += "        width: '100%',\n";
                appCode += "        minHeight: '100vh',\n";
                appCode += "        height: '100vh',\n";
                appCode += "        padding: '20px',\n";
                appCode += "        fontFamily: 'system-ui, -apple-system, sans-serif',\n";
                appCode += "        boxSizing: 'border-box',\n";
                appCode += "        display: 'flex',\n";
                appCode += "        alignItems: 'center',\n";
                appCode += "        justifyContent: 'center',\n";
                appCode += "        backgroundColor: 'transparent'\n";
                appCode += "      }}\n";
                appCode += "    >\n";
                
                if (htmlFile) {
                  appCode += "      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />\n";
                } else {
                  appCode += "      <div style={{\n";
                  appCode += "        maxWidth: '800px',\n";
                  appCode += "        margin: '0 auto',\n";
                  appCode += "        padding: '40px',\n";
                  appCode += "        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',\n";
                  appCode += "        borderRadius: '10px',\n";
                  appCode += "        color: 'white',\n";
                  appCode += "        textAlign: 'center'\n";
                  appCode += "      }}>\n";
                  appCode += "        <h1 style={{ marginTop: 0, fontSize: '2.5em' }}>🎉 Project Loaded!</h1>\n";
                  appCode += "        <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>\n";
                  appCode += "          Your project has been successfully loaded.\n";
                  appCode += "        </p>\n";
                  appCode += "        <div style={{\n";
                  appCode += "          background: 'rgba(255, 255, 255, 0.1)',\n";
                  appCode += "          padding: '20px',\n";
                  appCode += "          borderRadius: '8px',\n";
                  appCode += "          marginTop: '20px'\n";
                  appCode += "        }}>\n";
                  appCode += `          <p style={{ margin: '10px 0' }}>📁 Found ${fileCount} file(s)</p>\n`;
                  appCode += "          <p style={{ fontSize: '0.9em', opacity: 0.9 }}>\n";
                  appCode += jsFile ? "            JavaScript file detected and will be executed.\n" : "            Add React components (App.tsx, App.jsx) for better preview.\n";
                  appCode += "          </p>\n";
                  appCode += "        </div>\n";
                  appCode += "      </div>\n";
                }
                
                appCode += "    </div>\n";
                appCode += "  );\n";
                appCode += "}\n";
                
                filesObj["/src/App.tsx"] = {
                  code: appCode,
                  hidden: false,
                };
                
                filesObj["/src/main.tsx"] = {
                  code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(React.createElement(App));`,
                  hidden: false,
                };
              }
            }
            }
          } else {
            // Only create placeholder if we truly have no files
            console.warn("No files found, creating placeholder");
            filesObj["/src/App.tsx"] = {
              code: `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>No Files Found</h1>
      <p>Please upload your project files.</p>
    </div>
  );
}`,
              hidden: false,
            };
            filesObj["/src/main.tsx"] = {
              code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);`,
              hidden: false,
            };
            filesObj["/index.html"] = {
              code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Preview</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
              hidden: false,
            };
          } // End of if (Object.keys(filesObj).length > 0) block
        } catch (error) {
          console.error("Error loading project:", error);
          alert("Failed to load project. Please try uploading again.");
          router.push(`/event/${eventId}/user/upload`);
          return;
        }
      } // End of unzippedFiles processing block

      const finalFileCount = Object.keys(filesObj).length;
      console.log("Final files object:", Object.keys(filesObj));
      console.log("Entry file will be:", getEntryFileFromFiles(filesObj));
      console.log("Total files to display:", finalFileCount);
      
      // Only set files if we have some, otherwise keep loading state
      if (finalFileCount > 0) {
      setSandpackFiles(filesObj);
      setIsLoading(false);
        console.log("Files set successfully, loading complete. Total files:", finalFileCount);
      } else {
        // Only log as warning, not error, since this might be expected in some cases
        console.warn("No files to display after processing");
        if (unzippedFiles && Object.keys(unzippedFiles).length > 0) {
          console.warn("Unzipped files were found but none were processed. Check file extensions and exclusion rules.");
          console.warn("Sample file paths from zip:", Object.keys(unzippedFiles).slice(0, 10));
        } else if (!unzippedFiles && (!files || files.length === 0)) {
          console.warn("No files found in storage or upload store");
        }
        setIsLoading(false);
        
        // Only show alert if we truly have no files (not just processing issues)
        if (!unzippedFiles && (!files || files.length === 0)) {
          const errorMsg = `No previewable files found in your project.\n\n` +
            `Please ensure your zip file contains:\n` +
            `- JavaScript/TypeScript files (.js, .jsx, .ts, .tsx)\n` +
            `- HTML files (.html)\n` +
            `- CSS files (.css, .scss)\n\n` +
            `Please try uploading again.`;
          alert(errorMsg);
        }
        // Don't redirect - let user see the error and try again
      }
    };

    processFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, user, eventId]);

  const getEntryFile = (): string => {
    if (Object.keys(sandpackFiles).length === 0) return "/src/main.tsx";

    const entry = getEntryFileFromFiles(sandpackFiles);
    // Ensure the entry file exists in sandpackFiles
    if (!sandpackFiles[entry]) {
      console.warn(`Entry file ${entry} not found, using /src/main.tsx`);
      return "/src/main.tsx";
    }
    console.log("Using entry file:", entry);
    return entry;
  };

  const handleResize = (
    event: React.SyntheticEvent,
    { size }: { size: { width: number; height: number } }
  ) => {
    setExplorerWidth(size.width);
  };

  // Removed duplicate early return; main editor UI is rendered later in this component.

  // The small early-return UI was removed to avoid prematurely closing the Page component;
  // the full editor/preview UI is rendered below in the single main return.

  // --- Main Editor UI ---
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 font-sans text-zinc-300 overflow-hidden mt-16">
      {/* 1. Top Navigation Bar (Toolbar) */}
      <header className="h-14 shrink-0 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 z-20">
        {/* Left: Branding & Back */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <TerminalSquare className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-zinc-200 tracking-tight">
              Project Preview
            </span>
          </div>
        </div>

        {/* Right: Code / Preview Toggles */}
        <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800 flex items-center gap-1">
          {(["code", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-zinc-700 rounded-md shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab === "code" ? (
                  <Code2 className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* 2. Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading || Object.keys(sandpackFiles).length === 0 ? (
          <div className="flex items-center justify-center h-full bg-zinc-950">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-2 border-t-indigo-500 border-r-transparent border-b-indigo-500/30 border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-t-transparent border-r-cyan-500 border-b-transparent border-l-cyan-500/30 rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-sm font-semibold text-white">Loading Project</h3>
                <p className="text-xs text-zinc-500">
                  {isLoading ? "Processing files..." : "No files found. Please upload your project."}
                </p>
              </div>
            </div>
          </div>
        ) : (
        <SandpackProvider
            key={`${Object.keys(sandpackFiles).length}-${Date.now()}`}
          files={sandpackFiles}
          template="react-ts"
          theme={zincTheme}
            customSetup={{ 
              entry: getEntryFile(),
              dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
              }
            }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
            classes: {
                "sp-layout": "h-full",
                "sp-stack": "h-full",
              },
              activeFile: getEntryFile(),
              recompileDelay: 500,
            }}
          >
          <SandpackLayout className="!h-full !bg-transparent !border-none !rounded-none">
            {activeTab === "code" ? (
              <div className="flex w-full h-full">
                <Resizable
                  height={Infinity}
                  onResizeStop={handleResize}
                  handle={
                    <div className="w-1 cursor-col-resize hover:bg-indigo-500 transition-colors bg-zinc-800/50 h-auto" />
                  }
                  className="bg-zinc-900/50 border-r border-zinc-800 flex flex-col min-h-0"
                  width={explorerWidth}
                >
                  <div className="pl-0 h-full flex flex-col min-h-0">
                    <div className="relative mb-1 shrink-0">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div className="flex-1 flex flex-col ml-2 max-h-[600px]">
                      <div className="flex-1 pb-[400px] overflow-scroll">
                        <SandpackFileExplorer
                          autoHiddenFiles={true}
                          style={{
                            height: "100%",
                            minHeight: 0,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Resizable>
                <div className="flex-1 bg-zinc-950 h-full overflow-hidden">
                  <SandpackCodeEditor
                    showLineNumbers
                    showTabs
                    closableTabs={true}
                    wrapContent={false}
                    style={{
                      height: "80vh",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </div>
              </div>
            ) : (
              <SandpackPreview
                className="!bg-white"
                showOpenInCodeSandbox={false}
                showNavigator
                style={{ height: "100vh", width: "100vw" }}
              />
            )}
          </SandpackLayout>
        </SandpackProvider>
        )}
      </div>
    </div>
  );
};

export default Page;
