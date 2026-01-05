"use client";

import { useState } from "react";
import { DomainInput } from "./components/DomainInput";
import { CheckSpfButton } from "./components/CheckSpfButton";
import { SpfResults } from "./components/SpfResults";

export default function SpfChecker() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processedRecords, setProcessedRecords] = useState(null);
  const [allErrors, setAllErrors] = useState([]);
  const [error, setError] = useState("");

  const checkSpf = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain");
      return;
    }

    setIsLoading(true);
    setError("");
    setProcessedRecords(null);
    setAllErrors([]);

    try {
      const response = await fetch(
        `/api/check-spf?domain=${encodeURIComponent(domain.trim())}`
      );
      
      const data = await response.json();
      
      console.log("API Response:", data); // Debug log

      if (!response.ok) {
        setError(data.error || "Failed to check SPF record");
        return;
      }

      if (data.allErrors && data.allErrors.length > 0) {
        setAllErrors(data.allErrors);
      }

      if (data.processedRecords && data.processedRecords.length > 0) {
        setProcessedRecords(data.processedRecords);
      } else {
        setError("No SPF records found for this domain");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to check SPF record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      checkSpf();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            SPF Record Checker By Musabbir 🤖
          </h1>

          <div className="flex gap-3 mb-6">
            <DomainInput
              value={domain}
              onChange={setDomain}
              onKeyPress={handleKeyPress}
              placeholder="Enter any domain"
              disabled={isLoading}
            />
            <CheckSpfButton
              onClick={checkSpf}
              disabled={isLoading || !domain.trim()}
              isLoading={isLoading}
            />
          </div>

          <SpfResults
            processedRecords={processedRecords}
            error={error}
            isLoading={isLoading}
            domain={domain}
            allErrors={allErrors}
          />
        </div>
      </div>
    </div>
  );
}

