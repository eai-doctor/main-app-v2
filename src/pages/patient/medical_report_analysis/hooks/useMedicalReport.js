import { useState, useRef } from 'react';
import { uploadMedicalReport, chatMedicalReport } from '@/api/chatApi';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 10;

function buildWelcomeMessage(filename) {
  return `**${filename}** has been loaded. Ask me anything about this report.`;
}

export function useMedicalReport() {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const fileInputRef = useRef(null);

  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? null;

  const seedChat = (filename) => {
    setMessages([{ role: 'assistant', content: buildWelcomeMessage(filename) }]);
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Please upload a PDF, JPG, or PNG file.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert('File size must be under 10 MB.');
      e.target.value = '';
      return;
    }

    e.target.value = '';
    setIsUploadingReport(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadMedicalReport(formData);
      const { report_id } = res.data;

      const newReport = {
        id: Date.now().toString(),
        reportId: report_id,
        file,
        filename: file.name,
        fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
        uploadedAt: new Date(),
        sizeKB: Math.round(file.size / 1024),
      };

      setReports((prev) => [...prev, newReport]);
      setSelectedReportId(newReport.id);
      seedChat(newReport.filename);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to upload report. Please try again.';
      alert(msg);
    } finally {
      setIsUploadingReport(false);
    }
  };

  const handleSelectReport = (id) => {
    if (id === selectedReportId) return;
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    setSelectedReportId(id);
    seedChat(report.filename);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedReport || isLoadingChat) return;

    const userMessage = { role: 'user', content: input.trim() };
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setInput('');
    setIsLoadingChat(true);

    try {
      const apiHistory = currentHistory.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatMedicalReport(userMessage.content, selectedReport.reportId, apiHistory);
      const reply = res.data?.response || 'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errMsg, isError: true },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const clearChat = () => {
    if (selectedReport) {
      seedChat(selectedReport.filename);
    } else {
      setMessages([]);
    }
  };

  return {
    reports,
    selectedReportId,
    selectedReport,
    fileInputRef,
    handleFileInputChange,
    handleSelectReport,
    isUploadingReport,
    messages,
    input,
    setInput,
    isLoadingChat,
    sendMessage,
    clearChat,
  };
}
