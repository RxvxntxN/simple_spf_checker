import { useState } from "react";

export function ExpandableSpfRecord({ processedRecord, level = 0 }) {
  const [expandedIncludes, setExpandedIncludes] = useState({});
  const [loadingIncludes, setLoadingIncludes] = useState({});
  const [includeData, setIncludeData] = useState({});

  const toggleExpand = async (key, domain) => {
    if (expandedIncludes[key]) {
      setExpandedIncludes((prev) => ({ ...prev, [key]: false }));
      return;
    }

    if (!includeData[key] && !loadingIncludes[key]) {
      setLoadingIncludes((prev) => ({ ...prev, [key]: true }));

      try {
        const response = await fetch(
          `/api/check-spf?includeDomain=${encodeURIComponent(domain)}`
        );
        const data = await response.json();

        console.log(`Fetched data for ${domain}:`, data);

        setIncludeData((prev) => ({ ...prev, [key]: data }));
      } catch (error) {
        console.error(`Error fetching SPF record for ${domain}:`, error);
        setIncludeData((prev) => ({
          ...prev,
          [key]: {
            spfRecords: [],
            errors: [`Failed to fetch SPF record for ${domain}`],
          },
        }));
      } finally {
        setLoadingIncludes((prev) => ({ ...prev, [key]: false }));
      }
    }

    setExpandedIncludes((prev) => ({ ...prev, [key]: true }));
  };

  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 16)}` : "";

  return (
    <div className={`bg-gray-50 p-4 rounded-md ${indentClass}`}>
      <div className="font-mono text-sm break-words">
        {processedRecord.parts.map((part, index) => {
          const key = `${part.type}-${index}-${part.value}`;
          const isExpanded = expandedIncludes[key];
          const isLoading = loadingIncludes[key];
          const data = includeData[key];

          return (
            <span key={key} className="inline-block mr-2 mb-1">
              {part.type === "include" && (
                <span>
                  <span className="text-blue-600">include:</span>
                  <span
                    className="text-blue-700 font-medium cursor-pointer hover:underline"
                    onClick={() => toggleExpand(key, part.value)}
                  >
                    {part.value}
                  </span>
                  {isLoading && (
                    <span className="text-gray-500 text-xs ml-1">
                      (Loading...)
                    </span>
                  )}
                  {isExpanded && data && (
                    <div className="mt-2 ml-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                      {data.errors && data.errors.length > 0 ? (
                        <div className="text-red-600">
                          <div className="font-semibold mb-1">Errors:</div>
                          {data.errors.map((error, i) => (
                            <div key={i} className="text-xs">
                              {error}
                            </div>
                          ))}
                        </div>
                      ) : data.spfRecords && data.spfRecords.length > 0 ? (
                        <div>
                          <div className="text-gray-700 mb-2 font-semibold">
                            SPF record for {part.value}:
                          </div>
                          {data.spfRecords.map((record, i) => (
                            <div
                              key={i}
                              className="font-mono p-2 bg-white rounded mb-1 text-xs break-all"
                            >
                              {record}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <div className="font-semibold">Debug Info:</div>
                          <pre className="text-xs mt-1 bg-white p-2 rounded overflow-auto">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </span>
              )}
              {part.type === "redirect" && (
                <span>
                  <span className="text-purple-600">redirect=</span>
                  <span
                    className="text-purple-700 font-medium cursor-pointer hover:underline"
                    onClick={() => toggleExpand(key, part.value)}
                  >
                    {part.value}
                  </span>
                  {isLoading && (
                    <span className="text-gray-500 text-xs ml-1">
                      (Loading...)
                    </span>
                  )}
                  {isExpanded && data && (
                    <div className="mt-2 ml-4 p-3 bg-purple-50 border border-purple-200 rounded text-xs">
                      {data.errors && data.errors.length > 0 ? (
                        <div className="text-red-600">
                          <div className="font-semibold mb-1">Errors:</div>
                          {data.errors.map((error, i) => (
                            <div key={i} className="text-xs">
                              {error}
                            </div>
                          ))}
                        </div>
                      ) : data.spfRecords && data.spfRecords.length > 0 ? (
                        <div>
                          <div className="text-gray-700 mb-2 font-semibold">
                            Redirected SPF record for {part.value}:
                          </div>
                          {data.spfRecords.map((record, i) => (
                            <div
                              key={i}
                              className="font-mono p-2 bg-white rounded mb-1 text-xs break-all"
                            >
                              {record}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <div className="font-semibold">Debug Info:</div>
                          <pre className="text-xs mt-1 bg-white p-2 rounded overflow-auto">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </span>
              )}
              {part.type === "other" && (
                <span
                  className={
                    part.value.startsWith("v=")
                      ? "text-green-600 font-semibold"
                      : part.value.startsWith("-") ||
                        part.value.startsWith("~") ||
                        part.value.startsWith("+") ||
                        part.value.startsWith("?")
                      ? "text-orange-600 font-medium"
                      : "text-gray-700"
                  }
                >
                  {part.value}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
