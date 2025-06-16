import { API_BASE_URL } from "./api";
import { getAuthCookies, getAuthHeaders } from "./auth";

// Helper function to get auth headers with ngrok bypass

// Helper function to safely parse response
async function safeParseResponse(response) {
  // First, get the response as text
  const responseText = await response.text();

  console.log("Raw response:", responseText.substring(0, 200) + "...");
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries())
  );
  console.log("Response status:", response.status, response.statusText);

  // Check if it's HTML (ngrok warning page)
  if (
    responseText.trim().startsWith("<!DOCTYPE") ||
    responseText.trim().startsWith("<html")
  ) {
    console.error(
      "Received HTML instead of JSON. Full response:",
      responseText
    );

    // Check if it's ngrok warning page
    if (responseText.includes("ngrok") || responseText.includes("Visit Site")) {
      throw new Error(
        "ngrok is showing a warning page. Please add 'ngrok-skip-browser-warning: true' header or visit the URL in browser first."
      );
    }

    throw new Error(
      `Server returned HTML instead of JSON. This might be an error page. Status: ${response.status}`
    );
  }

  // Check if response is empty
  if (!responseText.trim()) {
    throw new Error(`Empty response from server. Status: ${response.status}`);
  }

  // Try to parse as JSON
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    console.error("Response text that failed to parse:", responseText);
    throw new Error(
      `Invalid JSON response: ${
        parseError.message
      }. Response: ${responseText.substring(0, 100)}...`
    );
  }
}

// Helper function to handle API responses
async function handleApiResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await safeParseResponse(response);
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (parseError) {
      console.error("Failed to parse error response:", parseError);
      // If we can't parse the error, include the status info
      errorMessage = `${errorMessage}. Unable to parse error details.`;
    }

    throw new Error(errorMessage);
  }

  return safeParseResponse(response);
}

// Admin Stats API
export async function getAdminStats() {
  try {
    console.log(
      "Fetching admin stats from:",
      `${API_BASE_URL}/api/admin/stats`
    );

    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Admin stats response:", response);
    return await handleApiResponse(response);
  } catch (error) {
    console.error("getAdminStats error:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Network error: Unable to connect to the API server. Please check your internet connection and API URL."
      );
    }

    if (error.message.includes("ngrok")) {
      throw new Error("ngrok configuration issue: " + error.message);
    }

    throw error;
  }
}

// Settings API
export async function getSettings() {
  try {
    console.log(
      "Fetching settings from:",
      `${API_BASE_URL}/api/admin/settings`
    );

    const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Settings response:", response);
    console.log(
      "Settings response headers:",
      Object.fromEntries(response.headers.entries())
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("getSettings error:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Network error: Unable to connect to the API server. Please check your internet connection and API URL."
      );
    }

    if (error.message.includes("ngrok")) {
      throw new Error("ngrok configuration issue: " + error.message);
    }

    throw error;
  }
}

export async function updateSetting(key, value, description) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings/${key}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ value, description }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("updateSetting error:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }

    throw error;
  }
}

// Users API
export async function getUsers(params) {
  try {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.append("skip", params.skip.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.role) searchParams.append("role", params.role);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/users?${searchParams}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("getUsers error:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }

    throw error;
  }
}

export async function getUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("getUser error:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }

    throw error;
  }
}

export async function updateUser(userId, userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("updateUser error:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }

    throw error;
  }
}

export async function updateUserRole(userId, role) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/role?role=${role}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("updateUserRole error:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }

    throw error;
  }
}

// Orders API Functions
export async function getOrders(params) {
  try {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.append("skip", params.skip.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.payment_status)
      searchParams.append("payment_status", params.payment_status);
    if (params.user_id)
      searchParams.append("user_id", params.user_id.toString());
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/orders?${searchParams}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("getOrders error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}

export async function getOrder(orderId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/orders/${orderId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("getOrder error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}

export async function updateOrder(orderId, data) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/orders/${orderId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("updateOrder error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}

export async function reprocessOrder(orderId, notes) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/orders/${orderId}/reprocess`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("reprocessOrder error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}

export async function refundOrder(orderId, refundNotes) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/orders/${orderId}/refund`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes: refundNotes }),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("refundOrder error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}

// Subtitle QA API Functions
export async function downloadSubtitleQA(subtitleId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/subtitle/${subtitleId}/qa-download`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error("downloadSubtitleQA error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}

export async function updateSubtitleQAStatus(subtitleId, qaStatus, qaNotes) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append("qa_status", qaStatus);
    if (qaNotes) searchParams.append("qa_notes", qaNotes);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/subtitle/${subtitleId}/qa-status?${searchParams}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error("updateSubtitleQAStatus error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}

export async function getAuditLogs(params) {
  try {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.append("skip", params.skip.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.user_id)
      searchParams.append("user_id", params.user_id.toString());
    if (params.entity_type)
      searchParams.append("entity_type", params.entity_type);
    if (params.entity_id)
      searchParams.append("entity_id", params.entity_id.toString());
    if (params.action) searchParams.append("action", params.action);
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/logs?${searchParams}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("getAuditLogs error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the API server.");
    }
    throw error;
  }
}
