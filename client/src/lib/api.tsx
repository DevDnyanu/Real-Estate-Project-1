const BASE = "http://localhost:5000"; // backend

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseJson = async (res) => {
  // Avoid "Unexpected end of JSON input" if server returns empty body
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return { success: res.ok }; // fallback
};

export const createListingApi = async (payload) => {
  const res = await fetch(`${BASE}/api/listings/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Failed to create listing");
  return data;
};

export const uploadImagesApi = async (listingId, files) => {
  const fd = new FormData();
  fd.append("listingId", listingId);
  [...files].forEach((f) => fd.append("images", f));

  const res = await fetch(`${BASE}/api/listings/upload-images`, {
    method: "POST",
    headers: { ...authHeaders() }, // important: don't set Content-Type manually
    body: fd,
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Image upload failed");
  return data;
};

// export const getListingsApi = async () => {
//   const res = await fetch(`${BASE}/api/listings`);
//   const data = await parseJson(res);
//   if (!res.ok) throw new Error(data.message || "Failed to fetch listings");
//   return data;
// };

export const getListingApi = async (id) => {
  const res = await fetch(`${BASE}/api/listings/${id}`);
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Failed to fetch listing");
  return data;
};

export const updateListingApi = async (id, payload) => {
  const res = await fetch(`${BASE}/api/listings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Failed to update listing");
  return data;
};

export const deleteListingApi = async (id) => {
  const res = await fetch(`${BASE}/api/listings/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Failed to delete listing");
  return data;
};
// lib/api.js
export const getListingsApi = async () => {
  try {
    const response = await fetch(`  ${BASE}/api/listings`);
    
    if (!response.ok) {
      
      throw new Error(`Failed to fetch listings: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("data",data)
    // Different response formats handle करें
    if (data && data.success !== undefined) {
      return data; // {success: true, listings: []}
    } else if (Array.isArray(data)) {
      return { success: true, listings: data }; // Direct array
    } else if (data && data.data) {
      return { success: true, listings: data.data }; // {data: []}
    } else {
      return { success: false, message: "Invalid response format" };
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { 
      success: false, 
      message: error.message,
      listings: []
    };
  }
};