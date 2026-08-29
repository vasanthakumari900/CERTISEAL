'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavbarPlatform from '@/components/NavbarPlatform';
import Footer from '@/components/Footer';
import { QrCode, Search, Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Camera, RefreshCw } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ID' | 'QR' | 'UPLOAD'>('ID');
  const [certIdInput, setCertIdInput] = useState('');
  const [qrScanInput, setQrScanInput] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sampleDemoCerts = [
    { id: 'CERT-2026-000123', label: 'Rahul Kumar', status: 'VERIFIED', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
    { id: 'CERT-2026-000124', label: 'Anita Sharma', status: 'ON_HOLD', color: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
    { id: 'CERT-2026-000125', label: 'Vikram Singh', status: 'RELEASED', color: 'border-blue-500/50 text-blue-400 bg-blue-500/10' },
    { id: 'CERT-2026-000126', label: 'Rajesh Verma', status: 'REVOKED', color: 'border-red-500/50 text-red-400 bg-red-500/10' }
  ];

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certIdInput.trim()) {
      router.push(`/verify/${certIdInput.trim().toUpperCase()}`);
    }
  };

  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = qrScanInput.replace(/.*\/verify\//, '').trim();
    if (clean) {
      router.push(`/verify/${clean.toUpperCase()}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadError(null);
    setIsProcessingUpload(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/verify/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setIsProcessingUpload(false);

      if (data.verificationResult) {
        sessionStorage.setItem('ocr_temp_result', JSON.stringify(data.verificationResult));
        router.push(`/verify/${data.verificationResult.publicId}?uploaded=true`);
      } else if (data.error) {
        setUploadError(data.error);
      }
    } catch (err: any) {
      setIsProcessingUpload(false);
      setUploadError(err.message || 'File processing failed');
    }
  };

  const handleSimulateTamperedUpload = async () => {
    setIsProcessingUpload(true);
    setUploadError(null);
    setTimeout(async () => {
      try {
        const formData = new FormData();
        const dummyBlob = new Blob(['Tampered Certificate: Rahul Kumar, B.Sc CS, CGPA: 9.72, CERT-2026-000123'], { type: 'text/plain' });
        formData.append('file', dummyBlob, 'rahul_kumar_tampered_cgpa_9.72.pdf');

        const res = await fetch('/api/verify/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        setIsProcessingUpload(false);

        if (data.verificationResult) {
          sessionStorage.setItem('ocr_temp_result', JSON.stringify(data.verificationResult));
          router.push(`/verify/${data.verificationResult.publicId}?uploaded=true`);
        }
      } catch (err: any) {
        setIsProcessingUpload(false);
        setUploadError('Simulation failed');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarPlatform />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Triple-Mode Certificate Verification Engine — CERTX Platform
          </div>
          <h1 className="text-3xl font-extrabold text-white">Verify a Certificate</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Scan QR code, enter Certificate ID, or upload document to evaluate authenticity, status, and ledger integrity.
          </p>
        </div>

        {/* Verification Mode Selector Tabs */}
        <div className="bg-navy-900/80 p-1.5 rounded-xl border border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('ID')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ID'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>METHOD B: CERTIFICATE ID</span>
          </button>

          <button
            onClick={() => setActiveTab('QR')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'QR'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>METHOD A: QR CAMERA SCAN</span>
          </button>

          <button
            onClick={() => setActiveTab('UPLOAD')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'UPLOAD'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>METHOD C: DOCUMENT UPLOAD & OCR</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-navy-900/60 rounded-2xl border border-slate-800 p-6 sm:p-8">
          {activeTab === 'ID' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Certificate ID Lookup</h3>
                <p className="text-xs text-slate-400">Enter the public Certificate ID printed on the institutional document.</p>
              </div>

              <form onSubmit={handleIdSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={certIdInput}
                    onChange={(e) => setCertIdInput(e.target.value)}
                    placeholder="e.g. CERT-2026-000123"
                    className="w-full pl-12 pr-4 py-3.5 bg-navy-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950"
                >
                  <span>VERIFY CERTIFICATE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Sample Pre-Seeded Certificates for SIH Demonstration:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sampleDemoCerts.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => router.push(`/verify/${sample.id}`)}
                      className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] flex items-center justify-between ${sample.color}`}
                    >
                      <div>
                        <p className="font-mono font-bold text-xs">{sample.id}</p>
                        <p className="text-[11px] opacity-90">{sample.label}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 font-mono">
                        {sample.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'QR' && (
            <div className="space-y-6 text-center">
              <div className="max-w-md mx-auto p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-navy-950 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Camera QR Scanner Active</h4>
                  <p className="text-xs text-slate-400 mt-1">Point your camera at the QR code printed on the official certificate.</p>
                </div>
              </div>

              <form onSubmit={handleQrSubmit} className="max-w-md mx-auto space-y-3">
                <div className="text-left">
                  <label className="text-xs font-semibold text-slate-400">Or Paste Scanned QR Code Data / URL:</label>
                  <input
                    type="text"
                    value={qrScanInput}
                    onChange={(e) => setQrScanInput(e.target.value)}
                    placeholder="http://localhost:3000/verify/CERT-2026-000123"
                    className="w-full mt-1.5 px-4 py-3 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>PROCESS SCANNED QR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'UPLOAD' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Document Upload & Field Mismatch Detection</h3>
                <p className="text-xs text-slate-400">Upload candidate certificate PDF or image. OCR extracts fields and compares against trusted institutional record.</p>
              </div>

              <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 bg-navy-950 p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessingUpload}
                />
                <Upload className="w-10 h-10 text-blue-400 mb-3" />
                <p className="text-sm font-semibold text-white">Click to Upload Certificate File</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, PNG, JPG, JPEG (Max 10MB)</p>
                {uploadFile && (
                  <div className="mt-3 px-3 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-mono">
                    Selected: {uploadFile.name}
                  </div>
                )}
              </label>

              {isProcessingUpload && (
                <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-300 flex items-center gap-3 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Processing OCR field extraction & running 8-level cryptographic verification...</span>
                </div>
              )}

              {uploadError && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {uploadError}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-2">Or test sample document tampering with 1 click:</p>
                <button
                  onClick={handleSimulateTamperedUpload}
                  disabled={isProcessingUpload}
                  className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Simulate Uploading Modified Document (CGPA 8.72 → 9.72)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
