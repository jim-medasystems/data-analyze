import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import FileUploader from './components/fileUploader';
import DataOutput from './components/dataOutput';

export type CombinedData = {
  fullData: any[];
  columnSuggestions: string;
};

const App = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columnSuggestions, setColumnSuggestions] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = (data: CombinedData) => {
    setCsvData(data.fullData);
    setColumnSuggestions(data.columnSuggestions);
  };

  return (
    <>
      <CssBaseline />
      <FileUploader
        onDataLoaded={handleDataLoaded}
        isDataLoaded={csvData.length > 0}
        setIsLoading={setIsLoading}
      />
      <DataOutput
        data={csvData}
        columnSuggestions={columnSuggestions ?? null}
        isLoading={isLoading}
      />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
