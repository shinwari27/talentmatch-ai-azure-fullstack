import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck2 } from 'lucide-react';

export default function FileUpload({ onFileSelected, accept = '.pdf,.docx', file }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) onFileSelected(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer border-2 border-dashed rounded-xl px-6 py-10 text-center transition-colors ${
        dragOver ? 'border-primary-600 bg-primary-50' : 'border-ink-300 bg-white hover:border-primary-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
      />
      {file ? (
        <div className="flex flex-col items-center gap-2 text-teal-700">
          <FileCheck2 size={32} />
          <p className="font-medium">{file.name}</p>
          <p className="text-xs text-ink-500">Click or drop a new file to replace it</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-ink-500">
          <UploadCloud size={32} className="text-primary-600" />
          <p className="font-medium text-ink-900">Drag & drop your resume here</p>
          <p className="text-sm">or click to browse · Supported: PDF, DOCX</p>
        </div>
      )}
    </div>
  );
}
