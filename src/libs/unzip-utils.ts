import { ZipReader, BlobReader, TextWriter } from '@zip.js/zip.js';

export async function unzipFromUrl(zipUrl: string): Promise<Record<string, string>> {
  console.log("Unzipping from URL:", zipUrl);
  
  // Handle relative URLs (local storage) by converting to API route
  let fetchUrl = zipUrl;
  if (zipUrl.startsWith('/uploads/')) {
    // For local storage, use the API route to serve the file
    // Remove leading /uploads/ and use API route
    const apiPath = zipUrl.replace('/uploads/', '');
    fetchUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/uploads/${apiPath}`
      : zipUrl; // Server-side will need full URL
  }
  
  console.log("Fetching zip from:", fetchUrl);
  const response = await fetch(fetchUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch zip file: ${response.status} ${response.statusText}`);
  }
  
  const blob = await response.blob();
  console.log("Zip blob size:", blob.size, "bytes");
  
  const zipReader = new ZipReader(new BlobReader(blob));
  const entries = await zipReader.getEntries();
  
  console.log(`Found ${entries.length} entries in zip`);
  
  // Log first 20 file paths to understand structure
  const fileEntries = entries.filter(e => !e.directory).slice(0, 20);
  console.log("Sample file paths from zip:", fileEntries.map(e => e.filename));
  
  const files: Record<string, string> = {};
  
  for (const entry of entries) {
    if (entry.directory) continue;
    
    try {
      // Read entry as text
      const textWriter = new TextWriter();
      const content = await entry.getData?.(textWriter);
      
      if (content !== undefined && content !== null) {
        // Ensure content is a string
        files[entry.filename] = typeof content === 'string' 
          ? content 
          : content instanceof Blob
          ? await content.text()
          : String(content);
      }
    } catch (error) {
      console.warn(`Failed to read entry ${entry.filename} as text, skipping:`, error);
      // Skip files that can't be read as text (binary files like images, etc.)
    }
  }

  await zipReader.close();
  console.log(`Successfully extracted ${Object.keys(files).length} files`);
  console.log("All extracted file paths:", Object.keys(files).slice(0, 30));
  return files;
}
