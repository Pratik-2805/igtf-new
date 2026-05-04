export async function getPresignedUrl(
  authFetch: any,
  file: File,
  folder: string
) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;  // ← FIXED

  if (!apiBase) throw new Error("Backend URL is missing");

  const params = new URLSearchParams({
    filename: file.name,
    filetype: file.type,
    folder,
  });

  const url = `${apiBase}/upload/presign/?${params.toString()}`; // ← FIX

  const res = await authFetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed to get presigned URL: " + text);
  }

  return await res.json();
}

export async function uploadToS3(uploadUrl: string, file: File) {
  const result = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!result.ok) {
    const text = await result.text();
    throw new Error("Failed to upload file: " + text);
  }

  return true;
}
