import React, { useState, useCallback, useRef, useEffect } from 'react';

interface PDFViewerProps {
  fileUrl: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, className = '' }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(100);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Construct PDF URL with parameters for better control
  const pdfUrl = `${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&page=${currentPage}&zoom=${scale}`;

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError('');
  }, []);

  const handleError = useCallback(() => {
    setError('Failed to load PDF document');
    setIsLoading(false);
  }, []);

  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(newPage);
    
    // Update iframe with new page
    if (iframeRef.current) {
      const newUrl = `${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&page=${newPage}&zoom=${scale}`;
      iframeRef.current.src = newUrl;
    }
  }, [fileUrl, scale, totalPages]);

  const zoomIn = useCallback(() => {
    const newScale = Math.min(300, scale + 25);
    setScale(newScale);
    
    if (iframeRef.current) {
      const newUrl = `${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&page=${currentPage}&zoom=${newScale}`;
      iframeRef.current.src = newUrl;
    }
  }, [fileUrl, currentPage, scale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(50, scale - 25);
    setScale(newScale);
    
    if (iframeRef.current) {
      const newUrl = `${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&page=${currentPage}&zoom=${newScale}`;
      iframeRef.current.src = newUrl;
    }
  }, [fileUrl, currentPage, scale]);

  const resetZoom = useCallback(() => {
    setScale(100);
    
    if (iframeRef.current) {
      const newUrl = `${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&page=${currentPage}&zoom=100`;
      iframeRef.current.src = newUrl;
    }
  }, [fileUrl, currentPage]);

  const downloadPDF = useCallback(() => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'document.pdf';
    link.target = '_blank';
    link.click();
  }, [fileUrl]);

  const openFullscreen = useCallback(() => {
    window.open(fileUrl, '_blank');
  }, [fileUrl]);

  // Estimate total pages (this is a limitation without PDF.js)
  useEffect(() => {
    // For demo purposes, we'll set a reasonable default
    // In a real app, you might need a server endpoint to get PDF metadata
    setTotalPages(10);
  }, [fileUrl]);

  if (error) {
    return (
      <div className={`bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center ${className}`}>
        <div className="text-c42-danger mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="mt-4 px-4 py-2 bg-c42-primary text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Open in New Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="1"
                max={totalPages}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">of {totalPages}</span>
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Zoom out"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300 w-12 text-center">
              {scale}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Zoom in"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={resetZoom}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Fit
            </button>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={openFullscreen}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Open in new tab"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </button>
            
            <button
              onClick={downloadPDF}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Download PDF"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-2 rounded-lg transition-colors ${
                showThumbnails 
                  ? 'bg-c42-primary text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
              aria-label="Toggle info panel"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Info Panel */}
        {showThumbnails && (
          <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Document Info</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Current Page: {currentPage}</div>
                  <div>Total Pages: {totalPages}</div>
                  <div>Zoom Level: {scale}%</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => goToPage(1)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    Go to First Page
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    Go to Last Page
                  </button>
                  <button
                    onClick={resetZoom}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    Reset Zoom
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use the browser's built-in PDF controls within the viewer for additional features like text selection and search.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Display */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c42-primary mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;