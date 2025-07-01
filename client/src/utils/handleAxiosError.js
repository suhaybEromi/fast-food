export const handleAxiosError = (err, setError) => {
  let technicalStatus;
  let message;

  if (typeof err === "string") {
    message = err;
  } else {
    technicalStatus = err?.response?.status;
    message =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong. Please try again.";
  }

  if (technicalStatus) {
    console.error(`Axios Error [Status ${technicalStatus}]: ${message}`);
  } else {
    console.error(message);
  }

  let userMessage = "An unexpected error occurred.";

  switch (technicalStatus) {
    case 400:
      userMessage = "Bad request. Please check your input.";
      break;
    case 401:
      userMessage = "You are not authorized. Please log in.";
      break;
    case 403:
      userMessage = "Access denied. You do not have permission to do this.";
      break;
    case 404:
      userMessage = "The requested resource was not found.";
      break;
    case 500:
      userMessage = "A server error occurred. Please try again later.";
      break;
    default:
      if (message.toLowerCase().includes("network")) {
        userMessage = "Network error. Please check your connection.";
      } else if (typeof err === "string") {
        userMessage = err;
      }
      break;
  }

  if (setError) {
    setError(userMessage);
  }
};
