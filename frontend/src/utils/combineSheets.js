function combineSheets(selectedSheets) {
  // Step 1: Combine headers
  const mergeHeaders = (currentHeaders, newHeaders) => {
    const merged = [...currentHeaders];
    if (newHeaders.length === 0) return merged; // Return if newHeaders is empty

    newHeaders.forEach((header) => {
      if (!merged.includes(header)) {
        merged.push(header); // Append only new headers to the end
      }
    });
    return merged;
  };
  
  let allHeaders = [];
  selectedSheets.forEach((list) => {
    allHeaders = mergeHeaders(allHeaders, list[0]);
  });

  // Step 2: Function to align data under the unified headers
  const alignData = (data, headers) => {
    const headerMap = Object.fromEntries(
      data[0].map((header, index) => [header, index])
    );
    return data
      .slice(1)
      .map((row) =>
        headers.map((header) =>
          header in headerMap ? row[headerMap[header]] : null
        )
      );
  };

  // Step 3: Align data from both lists
  const alignedData = selectedSheets.reduce(
    (acc, list) => acc.concat(alignData(list, allHeaders)),
    [allHeaders] // Start with the unified headers
  );

  return alignedData;
}

export default combineSheets;