const BASE = "http://localhost:5000";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseJson = async (res) => {
  const text = await res.text();
  if (!text) {
    return { success: res.ok };
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON parse error:", e, "Response text:", text);
    return { success: false, message: "Invalid JSON response" };
  }
};

// Create listing
export const createListingApi = async (payload) => {
  const res = await fetch(`${BASE}/api/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Failed to create listing");
  return data;
};

// Upload images
export const uploadImagesApi = async (listingId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file: File) => {
    formData.append("images", file);
  });

  const res = await fetch(`${BASE}/api/listings/${listingId}/upload-images`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Image upload failed");
  return data;
};

// Get single listing
export const getListingApi = async (id) => {
  try {
    const res = await fetch(`${BASE}/api/listings/${id}`);
    const data = await parseJson(res);
    
    if (!res.ok) {
      throw new Error(data.message || `Failed to fetch listing: ${res.status}`);
    }
    
    if (data && data.listing) {
      return data.listing;
    } else if (data && data.data) {
      return data.data;
    } else {
      return data;
    }
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

// Update listing
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

// Delete listing
export const deleteListingApi = async (id) => {
  const res = await fetch(`${BASE}/api/listings/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Failed to delete listing");
  return data;
};

// Get all listings
export const getListingsApi = async () => {
  try {
    const res = await fetch(`${BASE}/api/listings`);
    const data = await parseJson(res);
    
    if (!res.ok) {
      throw new Error(data.message || `Failed to fetch listings: ${res.status}`);
    }
    
    if (data && data.listings) {
      return { success: true, listings: data.listings };
    } else if (Array.isArray(data)) {
      return { success: true, listings: data };
    } else if (data && data.data) {
      return { success: true, listings: data.data };
    } else {
      return { success: false, message: "Invalid response format", listings: [] };
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