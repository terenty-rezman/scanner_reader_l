import { CONFIG } from "./../config.js";

export async function sendScannerData(payload) {
  // console.log("payload", payload);
  try {
    const { data: serverResponse } = await axios.post(
      CONFIG.API_URL + "/api/test/scanner-data",
      {
        scannerData: payload,
      },
      { headers: { [CONFIG.API_KEY_HEADER]: CONFIG.API_KEY } },
    );

    if (!serverResponse?.success) {
      throw new Error(serverResponse?.message || "Server returned failure");
    }

    console.log(serverResponse.message || "Success");

    return true;
  } catch (error) {
    if (error.response) {
      console.error("Server error:", error.response.data);
    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error("Request error:", error.message);
    }

    return false;
  }
}
