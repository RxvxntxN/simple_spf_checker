import { ExpandableSpfRecord } from "./ExpandableSpfRecord";

export function SpfResults({
  processedRecords,
  allErrors,
  error,
  isLoading,
  domain,
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (allErrors && allErrors.length > 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Errors occurred:</p>
        {allErrors.map((err, i) => (
          <p key={i} className="text-sm mt-1">
            {err}
          </p>
        ))}
      </div>
    );
  }

  if (!processedRecords || processedRecords.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">
        SPF Records for {domain}:
      </h2>

      <div className="space-y-3">
        {processedRecords.map((processedRecord, index) => (
          <ExpandableSpfRecord
            key={index}
            processedRecord={processedRecord}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
