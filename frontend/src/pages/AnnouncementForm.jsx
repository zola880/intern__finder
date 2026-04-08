import React, { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2,
  AlertCircle, 
  Send, 
  FileText, 
  Building2,
  CreditCard,
  Loader2,
  GraduationCap,
  Camera,
  ShieldCheck,
  X
} from "lucide-react";
import api from "../services/api";
import { useProfile } from "../hooks/useProfile";

const AnnouncementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    department: user?.department || "",
    year: user?.year || "1",
    bankAccount: user?.bankAccount || "",
  });
  const [file, setFile] = useState(null);
  const [studentIdPhoto, setStudentIdPhoto] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
    } catch (err) {
      alert("Camera access denied or not available.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        const file = new File([blob], "student_id.jpg", { type: "image/jpeg" });
        setStudentIdPhoto(file);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const verifyDocument = async () => {
    if (!file) {
      setError("Please upload an acceptance letter first.");
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);
    const formData = new FormData();
    formData.append("document", file);
    try {
      const response = await api.post("/announcements/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVerificationResult(response.data);
      if (!response.data.passed) {
        setError("AI has determined this document may not be valid. Please upload a genuine acceptance letter.");
      } else {
        setError("");
      }
    } catch (err) {
      setError("AI verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError("File size must be less than 5MB");
        setFile(null);
        return;
      }
      setFileError("");
      setFile(selectedFile);
      setVerificationResult(null);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload an acceptance letter");
      return;
    }
    if (verificationResult && !verificationResult.passed) {
      setError("Cannot submit: The acceptance letter appears invalid. Please upload a genuine document.");
      return;
    }
    if (!formData.bankAccount) {
      setError("Please enter a bank account number");
      return;
    }
    if (!/^\d{10,16}$/.test(formData.bankAccount)) {
      setError("Bank account must be 10-16 digits (numbers only)");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const formDataToSend = new FormData();
    formDataToSend.append("internshipId", id);
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("department", formData.department);
    formDataToSend.append("year", formData.year);
    formDataToSend.append("bankAccount", formData.bankAccount);
    formDataToSend.append("acceptanceLetter", file);
    if (studentIdPhoto) {
      formDataToSend.append("studentIdPhoto", studentIdPhoto);
    }

    try {
      await api.post("/announcements", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (formData.bankAccount !== user?.bankAccount) {
        await updateProfile({ bankAccount: formData.bankAccount });
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && !user.university) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">University Not Set</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Please update your profile with your university name before announcing an internship.
        </p>
        <Link to="/profile" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
          Go to Profile
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-200 dark:border-emerald-800"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">Announcement Sent!</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-12">
          Your university has been notified. Your stipend processing will begin shortly.
          <br />
          <span className="text-sm">Your bank account information is encrypted and secure.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/internships" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold">
            Browse More Internships
          </Link>
          <Link to="/my-announcements" className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold">
            View My Announcements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 font-medium mb-6 sm:mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 sm:p-8 bg-emerald-600 text-white flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Internship Announcement</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">Notify your university about your secured internship</p>
          </div>
          <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-200 opacity-50" />
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Full Name</label>
              <input
                required
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Department</label>
              <input
                required
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Software Engineering"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Year of Study</label>
              <select
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {["1", "2", "3", "4", "5"].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-400" />
                Bank Account Number (for Stipend)
              </label>
              <input
                required
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1000123456789 (10-16 digits)"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">This information is encrypted and only visible to university admins.</p>
            </div>
          </div>

          {/* Acceptance Letter */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Acceptance Letter / Recommendation</label>
            <div className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all group cursor-pointer ${
              fileError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50'
            }`}>
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  fileError ? 'bg-red-100 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
                }`}>
                  <Upload className={`w-6 h-6 ${fileError ? 'text-red-600' : 'text-emerald-600'}`} />
                </div>
                {file ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-zinc-500">PDF, PNG or JPG (max 5MB)</p>
                  </>
                )}
                {fileError && <p className="text-xs text-red-600">{fileError}</p>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={verifyDocument}
                disabled={!file || isVerifying}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                AI Verify Document
              </button>
            </div>
            {verificationResult && (
              <div className={`mt-3 p-3 rounded-xl text-sm ${verificationResult.passed ? 'bg-green-50 dark:bg-green-900/20 text-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800'}`}>
                <p className="font-semibold">AI Analysis: {verificationResult.passed ? '✓ Likely valid' : '✗ Invalid'}</p>
                <p className="text-xs mt-1">{verificationResult.reason}</p>
                {!verificationResult.passed && <p className="text-xs mt-2">You cannot submit this document. Please upload a genuine acceptance letter.</p>}
              </div>
            )}
          </div>

          {/* Student ID Photo Capture */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Student ID Photo (Optional but recommended)
            </label>
            <div className="flex flex-col gap-3">
              {!showCamera && !studentIdPhoto && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-all w-full"
                >
                  <Camera className="w-5 h-5" />
                  Take photo of your ID card
                </button>
              )}
              {showCamera && (
                <div className="relative">
                  <video ref={videoRef} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700" autoPlay playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={capturePhoto} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium">Capture</button>
                    <button type="button" onClick={stopCamera} className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg text-sm font-medium">Cancel</button>
                  </div>
                </div>
              )}
              {studentIdPhoto && (
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">Student ID photo captured</span>
                  </div>
                  <button type="button" onClick={() => setStudentIdPhoto(null)} className="p-2 text-red-500 hover:text-red-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500">This helps the university admin verify your identity.</p>
          </div>

          <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isSubmitting || (verificationResult && !verificationResult.passed)}
              className="w-full py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Announcement...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;