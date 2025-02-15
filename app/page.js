"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [token, setToken] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [responseHeaders, setResponseHeaders] = useState("");
  const [tokenList, setTokenList] = useState([]);
  const [params, setParams] = useState([{ key: "", value: "" }]);
  const [environment, setEnvironment] = useState("Development");
  const [darkMode, setDarkMode] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);
  const [requestName, setRequestName] = useState(""); // New state for request name

  useEffect(() => {
    setDarkMode(localStorage.getItem("darkMode") === "true");
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    const storedTokens = JSON.parse(localStorage.getItem("tokens")) || [];
    setTokenList(storedTokens);
  }, []);

  useEffect(() => {
    if (tokenList.length > 0) {
      localStorage.setItem("tokens", JSON.stringify(tokenList));
    }
  }, [tokenList]);

  useEffect(() => {
    const storedRequests =
      JSON.parse(localStorage.getItem("recentRequests")) || [];
    setRecentRequests(storedRequests);
  }, []);

  useEffect(() => {
    if (recentRequests.length > 0) {
      localStorage.setItem("recentRequests", JSON.stringify(recentRequests));
    }
  }, [recentRequests]);

  const saveRecentChanges = () => {
    if (!requestName) return alert("Please enter a request name"); // Validate request name
    const currentState = {
      name: requestName, // Include request name
      url,
      method,
      token,
      headers,
      params,
      body,
      environment,
    };
    setRecentRequests((prevRequests) => [...prevRequests, currentState]);
    setRequestName(""); // Clear the request name field after saving
    alert("Recent changes saved!");
  };

  const handleRequest = async () => {
    if (!url) return alert("Please enter URL");

    let modifiedUrl = url;
    const queryParams = params
      .filter((param) => param.key && param.value)
      .map((param) => `${param.key}=${param.value}`)
      .join("&");

    if (queryParams) {
      modifiedUrl += `?${queryParams}`;
    }

    const headersObject = headers.reduce((acc, header) => {
      if (header.key && header.value) acc[header.key] = header.value;
      return acc;
    }, {});

    let requestBody = null;
    if (method !== "GET" && body.trim() !== "") {
      try {
        requestBody = JSON.stringify(JSON.parse(body));
      } catch (error) {
        console.error("Invalid JSON body:", error);
        alert("Invalid JSON format in request body.");
        return;
      }
    }

    try {
      const res = await fetch(modifiedUrl, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...headersObject,
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      setResponse(await res.json());
      setResponseHeaders(res.headers);
      saveRecentChanges(); // Save the request after successful response
    } catch (error) {
      console.error("Error:", error);
      setResponse({ error: "Request failed" });
    }
  };

  const loadRequest = (request) => {
    setRequestName(request.name); // Load request name
    setUrl(request.url);
    setMethod(request.method);
    setToken(request.token);
    setHeaders(request.headers);
    setParams(request.params);
    setBody(request.body);
    setEnvironment(request.environment);
  };

  const handleHeaderChange = (index, type, value) => {
    const newHeaders = [...headers];
    newHeaders[index][type] = value;
    setHeaders(newHeaders);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleParamChange = (index, type, value) => {
    const newParams = [...params];
    newParams[index][type] = value;
    setParams(newParams);
  };

  const handleAddParam = () => {
    setParams([...params, { key: "", value: "" }]);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Request Tool</h1>
      {/* Toggle Dark Mode */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600 transition-colors mb-4"
      >
        Toggle Dark Mode
      </button>
      {/* API Details Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Left Column */}
        <div>
          <label className="block font-medium mb-1">Request Name:</label>
          <input
            type="text"
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            placeholder="Enter a name for this request"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
          />

          <label className="block font-medium mt-4 mb-1">Environment:</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="Development">Development</option>
            <option value="Staging">Staging</option>
            <option value="Production">Production</option>
          </select>

          <label className="block font-medium mt-4 mb-1">URL:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter API URL"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
          />

          <label className="block font-medium mt-4 mb-1">Method:</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          <label className="block font-medium mt-4 mb-1">Token:</label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white mb-2"
          >
            <option value="">Select Token</option>
            {tokenList.map((tokenItem, index) => (
              <option key={index} value={tokenItem}>
                {tokenItem}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Add a new token"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => setTokenList([...tokenList, token])}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-2"
          >
            Add Token
          </button>
        </div>

        {/* Right Column */}
        <div>
          <label className="block font-medium mb-1">Headers:</label>
          {headers.map((header, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={header.key}
                onChange={(e) =>
                  handleHeaderChange(index, "key", e.target.value)
                }
                placeholder="Key"
                className="flex-1 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) =>
                  handleHeaderChange(index, "value", e.target.value)
                }
                placeholder="Value"
                className="flex-1 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}
          <button
            onClick={handleAddHeader}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add Header
          </button>

          <label className="block font-medium mt-4 mb-1">URL Params:</label>
          {params.map((param, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={param.key}
                onChange={(e) =>
                  handleParamChange(index, "key", e.target.value)
                }
                placeholder="Key"
                className="flex-1 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) =>
                  handleParamChange(index, "value", e.target.value)
                }
                placeholder="Value"
                className="flex-1 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}
          <button
            onClick={handleAddParam}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors mt-2"
          >
            Add Param
          </button>

          <label className="block font-medium mt-4 mb-1">Body (JSON):</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows="6"
            placeholder="Enter request body as JSON"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      {/* Send Request Button */}
      <button
        onClick={handleRequest}
        className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600 transition-colors w-full"
      >
        Save Recent Changes & Send Request
      </button>
      {/* Response Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Response</h2>
        <pre className="p-4 bg-gray-800 text-white rounded">
          {response ? JSON.stringify(response, null, 2) : "No response yet"}
        </pre>
      </div>
      {/* Response Headers Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Response Headers</h2>
        <pre className="p-4 bg-gray-800 text-white rounded">
          {JSON.stringify(responseHeaders, null, 2)}
        </pre>
      </div>{" "}
      {/* Recent Requests Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recent Requests</h2>
        <ul className="space-y-2">
          {recentRequests.map((request, index) => (
            <li key={index}>
              <button
                onClick={() => loadRequest(request)}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors w-full flex items-center justify-between"
              >
                <span>{request.name || `Request ${index + 1}`}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
