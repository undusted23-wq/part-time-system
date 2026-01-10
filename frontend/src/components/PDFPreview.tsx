import React, { useState } from 'react';
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
import { Scroller, ScrollPluginPackage } from '@embedpdf/plugin-scroll/react';
import { DocumentContent, DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/react';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
import { Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFPreviewProps {
  fileUrl: string;
  className?: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ fileUrl, className = '' }) => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const { engine, isLoading } = usePdfiumEngine();

  // 注册插件
  const plugins = React.useMemo(() => [
    createPluginRegistration(DocumentManagerPluginPackage, {
      initialDocuments: [{ url: fileUrl }],
    }),
    createPluginRegistration(ViewportPluginPackage),
    createPluginRegistration(ScrollPluginPackage),
    createPluginRegistration(RenderPluginPackage),
  ], [fileUrl]);

  if (isLoading || !engine) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">正在加载PDF引擎...</span>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <EmbedPDF engine={engine} plugins={plugins}>
        {({ activeDocumentId }) => {
          // 当文档加载完成后设置documentId
          React.useEffect(() => {
            if (activeDocumentId && !documentId) {
              setDocumentId(activeDocumentId);
            }
          }, [activeDocumentId, documentId]);

          return (
            <div className="relative">
              {/* PDF工具栏 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                <div className="text-sm text-gray-600">
                  PDF预览
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* PDF内容区域 */}
              <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
                {activeDocumentId && (
                  <DocumentContent documentId={activeDocumentId}>
                    {({ isLoaded }) => {
                      if (!isLoaded) {
                        return (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2">正在加载PDF...</span>
                          </div>
                        );
                      }

                      return (
                        <Viewport
                          documentId={activeDocumentId}
                          style={{
                            backgroundColor: '#f8f9fa',
                            height: '100%',
                            width: '100%',
                          }}
                        >
                          <Scroller
                            documentId={activeDocumentId}
                            renderPage={({ width, height, pageIndex }) => (
                              <div
                                style={{
                                  width,
                                  height,
                                  marginBottom: '8px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  backgroundColor: 'white',
                                }}
                              >
                                <RenderLayer
                                  documentId={activeDocumentId}
                                  pageIndex={pageIndex}
                                />
                              </div>
                            )}
                          />
                        </Viewport>
                      );
                    }}
                  </DocumentContent>
                )}
              </div>
            </div>
          );
        }}
      </EmbedPDF>
    </div>
  );
};