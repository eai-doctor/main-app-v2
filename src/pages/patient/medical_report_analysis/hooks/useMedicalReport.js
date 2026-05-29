import { useState, useRef } from 'react';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 10;

const MOCK_RESPONSES = [
  (filename) => `Based on **${filename}**, I can see the uploaded document. Once the AI backend is connected, I'll analyze its contents in detail. What specific aspect would you like to focus on?`,
  (filename) => `I've reviewed **${filename}**. Please ask me about specific values, trends, or concerns and I'll walk you through them once the analysis backend is live.`,
  (filename) => `Thank you for uploading **${filename}**. I'm ready to help interpret the results. What would you like to know?`,
  () => `That's a great question. Once the AI backend is connected, I'll provide a detailed analysis. For now, can you describe what you're seeing in the report?`,
  () => `I understand your concern. When the full analysis feature is enabled, I'll cross-reference your report values against standard ranges. Is there a particular section you'd like to discuss?`,
];

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

  const handleFileInputChange = (e) => {
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

    setIsUploadingReport(true);

    const newReport = {
      id: Date.now().toString(),
      file,
      filename: file.name,
      fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
      uploadedAt: new Date(),
      sizeKB: Math.round(file.size / 1024),
    };

    setTimeout(() => {
      setReports((prev) => [...prev, newReport]);
      setSelectedReportId(newReport.id);
      seedChat(newReport.filename);
      setIsUploadingReport(false);
    }, 400);

    e.target.value = '';
  };

  const handleSelectReport = (id) => {
    if (id === selectedReportId) return;
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    setSelectedReportId(id);
    seedChat(report.filename);
    setInput('');
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedReport || isLoadingChat) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoadingChat(true);

    const delay = 800 + Math.random() * 600;
    const pick = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const reply = pick(selectedReport.filename);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsLoadingChat(false);
    }, delay);
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
