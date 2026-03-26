import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type FlowType = 'initial' | 'tenancy' | 'employment' | 'family' | 'contract' | 'notice' | 'clarifying';

interface IntakeState {
  flow: FlowType;
  step: number;
  category: string;
  urgency: string;
  urgencyReason: string;
  facts: { text: string; source: string; label: string }[];
  missingInfo: string[];
  suggestedDocs: string[];
  actionList: { action: string; reason: string }[];
  timeline: string[];
  isComplete: boolean;
}

import {
  Scale,
  Clock,
  Coins,
  MessageSquare,
  ShieldCheck,
  Zap,
  FileText,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Send,
  Lock,
  ArrowRight,
  Briefcase,
  AlertCircle,
  FileSearch,
  Building2,
  User,
  Menu,
  X,
  Download,
  Calendar,
  Check,
  Info,
  Bot,
  Video,
  MapPin,
  Phone,
  Mic,
  MicOff,
  VideoOff,
  Camera,
  PhoneOff,
  Sparkles,
  Play,
  Building,
  Compass
} from 'lucide-react';

const documentTypes = {
  fine_notice: {
    label: 'Fine Notice',
    aiResponse: 'Document received and analyzed.\n\nClassification: Regulatory Fine / Liability Notice\n\nInitial Assessment: This document indicates a potential liability for a regulatory or parking offense. Time-sensitive action may be required to preserve your right to appeal.\n\nRecommended Immediate Actions:\n• Verify the identity of the legally liable party.\n• Identify any stated appeal deadlines.\n• Do not make payment if you intend to dispute, as this may be construed as an admission of liability.',
    summary: {
      caseType: 'Regulatory Fine / Liability',
      urgency: 'Medium',
      nextSteps: [
        'Confirm legally liable party',
        'Gather ownership evidence',
        'Check appeal deadline',
        'Decide on dispute vs payment'
      ],
      missingInfo: [
        'Identity of issuing party',
        'Deadline confirmation',
        'Related correspondence'
      ],
      lawyerAdvisable: 'Optional - unless fine is substantial or involves criminal liability'
    },
    packetData: {
      timeline: [
        'Notice received on 12 Feb 2026',
        'User submitted supporting explanation',
        'Payment / response deadline identified',
        'Escalation decision pending'
      ],
      questions: [
        'Am I legally liable under this notice?',
        'Is there a basis to dispute this claim?',
        'What happens if I do not respond by the deadline?',
        'What evidence will strengthen my position?'
      ],
      checklist: [
        'Relevant correspondence',
        'Receipts / payment proof',
        'Screenshots / photos',
        'Identity of issuing party'
      ],
      nextActions: [
        'Prepare appeal or dispute response',
        'Gather supporting documents',
        'Book lawyer consultation',
        'Monitor for response deadline'
      ]
    }
  },
  demand_letter: {
    label: 'Demand Letter',
    aiResponse: 'Document received and analyzed.\n\nClassification: Formal Legal Demand / Pre-Action Notice\n\nInitial Assessment: This is a formal demand letter indicating that the sender intends to pursue legal action if their demands are not met. Ignoring this document may result in default judgment.\n\nRecommended Immediate Actions:\n• Note the exact response deadline stipulated in the letter.\n• Do not contact the sender directly without legal counsel.\n• Preserve all related communications and contracts.',
    summary: {
      caseType: 'Formal Legal Demand',
      urgency: 'High',
      nextSteps: [
        'Do not ignore the notice',
        'Check response deadline',
        'Gather supporting communications',
        'Consider lawyer escalation'
      ],
      missingInfo: [
        'Original contract or agreement',
        'Proof of prior payments/communications',
        'Counter-claim evidence'
      ],
      lawyerAdvisable: 'Highly Recommended - to draft a formal response and avoid default judgment'
    },
    packetData: {
      timeline: [
        'Demand letter received',
        'Initial AI triage completed',
        'Pending lawyer review and consultation',
        'Response/Action deadline (TBC)'
      ],
      questions: [
        'Are the claims in the demand letter legally valid?',
        'What is the best strategy to respond without admitting liability?',
        'What are the costs of defending against this claim?',
        'Can we negotiate a settlement before court action?'
      ],
      checklist: [
        'Original contract or agreement',
        'Proof of prior payments/communications',
        'Counter-claim evidence',
        'Identity documents of involved parties'
      ],
      nextActions: [
        'Draft formal response letter',
        'Gather supporting communications',
        'Book lawyer consultation',
        'Do not contact sender directly'
      ]
    }
  },
  court_notice: {
    label: 'Court Notice',
    aiResponse: 'Document received and analyzed.\n\nClassification: Active Court Proceedings / Summons\n\nInitial Assessment: This document confirms that formal legal proceedings have been initiated against you. Strict procedural deadlines now apply.\n\nRecommended Immediate Actions:\n• Identify the date, time, and venue of the hearing or deadline.\n• Prepare to file a Memorandum of Appearance or Defense.\n• Retain legal representation immediately to navigate court procedures.',
    summary: {
      caseType: 'Active Court Proceedings',
      urgency: 'Critical',
      nextSteps: [
        'Note hearing date and venue',
        'Identify nature of the claim',
        'File Memorandum of Appearance',
        'Seek legal representation'
      ],
      missingInfo: [
        'Full Statement of Claim',
        'Supporting evidence for defense',
        'Chronology of events'
      ],
      lawyerAdvisable: 'Mandatory - navigating court procedures requires professional representation'
    },
    packetData: {
      timeline: [
        'Court summons received',
        'Initial AI triage completed',
        'Pending lawyer review and consultation',
        'Hearing date / Appearance deadline (TBC)'
      ],
      questions: [
        'What are the immediate deadlines I must meet?',
        'What happens if I miss the hearing date?',
        'What are my options for defense or settlement?',
        'How much will legal representation cost for this proceeding?'
      ],
      checklist: [
        'Full Statement of Claim',
        'Supporting evidence for defense',
        'Chronology of events',
        'Identity documents of involved parties'
      ],
      nextActions: [
        'Note hearing date and venue',
        'File Memorandum of Appearance',
        'Book lawyer consultation immediately',
        'Do not ignore the summons'
      ]
    }
  },
  tenancy_agreement: {
    label: 'Tenancy Agreement',
    aiResponse: 'Document received and analyzed.\n\nClassification: Tenancy / Lease Agreement\n\nInitial Assessment: This document governs the legal relationship between landlord and tenant. Disputes typically center around termination, deposits, or maintenance obligations.\n\nRecommended Immediate Actions:\n• Identify the specific clause relevant to your dispute.\n• Review notice period requirements and diplomatic clauses.\n• Compile inventory lists and condition reports from move-in/move-out.',
    summary: {
      caseType: 'Tenancy / Lease Dispute',
      urgency: 'Medium',
      nextSteps: [
        'Identify disputed clause',
        'Check notice period',
        'Review diplomatic clause',
        'Gather inventory lists'
      ],
      missingInfo: [
        'Move-in/Move-out condition reports',
        'Photographic evidence of property',
        'Correspondence with landlord/agent'
      ],
      lawyerAdvisable: 'Recommended - if the deposit amount is large or eviction is threatened'
    },
    packetData: {
      timeline: [
        'Tenancy agreement uploaded',
        'Initial AI triage completed',
        'Pending lawyer review and consultation',
        'Notice period / Termination date (TBC)'
      ],
      questions: [
        'Is the landlord entitled to withhold my deposit?',
        'Can I terminate the lease early under the diplomatic clause?',
        'Who is responsible for the repair costs?',
        'What are my rights if the landlord threatens eviction?'
      ],
      checklist: [
        'Move-in/Move-out condition reports',
        'Photographic evidence of property',
        'Correspondence with landlord/agent',
        'Receipts for repairs/maintenance'
      ],
      nextActions: [
        'Identify disputed clause in agreement',
        'Gather inventory lists and photos',
        'Book lawyer consultation',
        'Communicate with landlord in writing'
      ]
    }
  },
  contract: {
    label: 'Contract',
    aiResponse: 'Document received and analyzed.\n\nClassification: Commercial Contract\n\nInitial Assessment: This is a binding commercial agreement. To evaluate a potential breach, the specific obligations and limitation clauses must be reviewed.\n\nRecommended Immediate Actions:\n• Pinpoint the exact obligation that was allegedly breached.\n• Review termination, dispute resolution, and limitation of liability clauses.\n• Compile evidence demonstrating performance or non-performance.',
    summary: {
      caseType: 'Commercial Contract Dispute',
      urgency: 'Medium',
      nextSteps: [
        'Pinpoint breached obligation',
        'Review termination clauses',
        'Check limitation of liability',
        'Compile performance evidence'
      ],
      missingInfo: [
        'Amendments or side letters',
        'Proof of delivery/payment',
        'Written notices of breach'
      ],
      lawyerAdvisable: 'Highly Recommended - to enforce terms or defend against breach claims'
    },
    packetData: {
      timeline: [
        'Contract uploaded',
        'Initial AI triage completed',
        'Pending lawyer review and consultation',
        'Breach notification deadline (TBC)'
      ],
      questions: [
        'Has a material breach of contract occurred?',
        'What are the remedies available under the contract?',
        'Are the limitation of liability clauses enforceable?',
        'What is the process for dispute resolution?'
      ],
      checklist: [
        'Amendments or side letters',
        'Proof of delivery/payment',
        'Written notices of breach',
        'Correspondence regarding performance'
      ],
      nextActions: [
        'Pinpoint breached obligation',
        'Compile performance evidence',
        'Book lawyer consultation',
        'Review dispute resolution clause'
      ]
    }
  },
  other: {
    label: 'Other Legal Document',
    aiResponse: 'Document received and analyzed.\n\nClassification: Uncategorized Legal Document\n\nInitial Assessment: To provide an accurate legal triage, additional contextual information is required regarding the nature of the dispute and the parties involved.\n\nRecommended Immediate Actions:\n• Summarize the main issue and your desired outcome.\n• Identify all parties involved in the matter.\n• Organize any related correspondence or supplementary documents.',
    summary: {
      caseType: 'Uncategorized Legal Matter',
      urgency: 'Unknown',
      nextSteps: [
        'Summarize the main issue',
        'Identify parties involved',
        'State desired outcome',
        'Organize related documents'
      ],
      missingInfo: [
        'Context of the dispute',
        'Timeline of events',
        'Specific legal questions'
      ],
      lawyerAdvisable: 'Advisable - to properly classify and strategize your case'
    },
    packetData: {
      timeline: [
        'Document uploaded',
        'Initial AI triage completed',
        'Pending lawyer review and consultation',
        'Next steps to be determined'
      ],
      questions: [
        'What are my legal rights and obligations in this situation?',
        'What is the best course of action to achieve my desired outcome?',
        'What are the potential risks and liabilities?',
        'How much will legal representation cost?'
      ],
      checklist: [
        'Context of the dispute',
        'Timeline of events',
        'Specific legal questions',
        'Identity documents of involved parties'
      ],
      nextActions: [
        'Summarize the main issue',
        'Organize related documents',
        'Book lawyer consultation',
        'Identify parties involved'
      ]
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'chatbot' | 'teleconsult'>('chatbot');
  const [teleconsultStep, setTeleconsultStep] = useState(1);
  const [teleconsultData, setTeleconsultData] = useState({
    issueCategory: '',
    description: '',
    urgency: '',
    preferredTime: ''
  });
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'ai', text: 'Hello, I am Lion LawSense AI. I can help you understand your legal next step in Singapore. Briefly describe your issue or upload a document, and I’ll guide you from there.', type: 'text' }
  ]);
  const [selectedDocType, setSelectedDocType] = useState<keyof typeof documentTypes>('demand_letter');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [intakeState, setIntakeState] = useState<IntakeState>({
    flow: 'initial',
    step: 0,
    category: 'Detecting...',
    urgency: 'Pending Assessment',
    urgencyReason: '',
    facts: [],
    missingInfo: [],
    suggestedDocs: [],
    actionList: [],
    timeline: [],
    isComplete: false,
  });
  const [triageSummary, setTriageSummary] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [earlyAccessSubmitted, setEarlyAccessSubmitted] = useState(false);
  const [isPacketGenerated, setIsPacketGenerated] = useState(false);
  const [isPacketModalOpen, setIsPacketModalOpen] = useState(false);
  const [isGeneratingPacket, setIsGeneratingPacket] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showLawyerModal, setShowLawyerModal] = useState(false);
  const [isUrgentCallModalOpen, setIsUrgentCallModalOpen] = useState(false);
  const [isConnectingUrgent, setIsConnectingUrgent] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleGeneratePacket = () => {
    setIsGeneratingPacket(true);
    setTimeout(() => {
      setIsGeneratingPacket(false);
      setIsPacketGenerated(true);
      setIsPacketModalOpen(true);
    }, 1500);
  };

  const handleUrgentCall = () => {
    setIsUrgentCallModalOpen(true);
    setIsConnectingUrgent(true);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setTimeout(() => {
      setIsConnectingUrgent(false);
    }, 3000);
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUrgentCallModalOpen && !isConnectingUrgent) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isUrgentCallModalOpen, isConnectingUrgent]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownloadPacket = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    let file: File | null = null;
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    } else if (e.target.files) {
      file = e.target.files[0];
    }
    
    if (!file) return;

    const newFile = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    };

    setUploadedFile(newFile);
    
    setChatHistory(prev => [
      ...prev,
      { role: 'user', type: 'file', file: newFile }
    ]);

    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress > 100) progress = 100;
      setUploadProgress(progress);
      
      if (progress === 100) {
        clearInterval(interval);
        setIsUploading(false);
        setIsAnalyzing(true);

        setTimeout(() => {
          const docData = documentTypes[selectedDocType];
          setChatHistory(prev => [
            ...prev,
            { role: 'ai', type: 'text', text: docData.aiResponse }
          ]);
          setTriageSummary(docData.summary);
          setIsAnalyzing(false);
        }, 2000);
      }
    }, 200);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setTriageSummary(null);
    setIsPacketGenerated(false);
    setChatHistory([
      { role: 'ai', text: 'Hello, I am Lion LawSense AI. To begin your legal triage, please upload the primary document related to your issue (e.g., a demand letter, fine notice, or contract).', type: 'text' }
    ]);
  };

  const handleTabSwitch = (tab: 'chatbot' | 'teleconsult') => {
    setActiveTab(tab);
    if (tab === 'chatbot') {
      setUploadedFile(null);
      setTriageSummary(null);
      setIsPacketGenerated(false);
      setChatInput('');
      setChatHistory([
        { role: 'ai', text: 'Hello, I am Lion LawSense AI. I can help you understand your legal next step in Singapore. Briefly describe your issue or upload a document, and I’ll guide you from there.', type: 'text' }
      ]);
    } else {
      setTeleconsultStep(1);
      setTeleconsultData({
        issueCategory: '',
        description: '',
        urgency: '',
        preferredTime: ''
      });
    }
  };

  const processSimulatedChat = (text: string) => {
    const lowerText = text.toLowerCase();
    let newState = { ...intakeState };
    let aiResponse = '';

    // 1. Determine flow if initial
    if (newState.flow === 'initial') {
      if (lowerText.match(/landlord|tenancy|deposit|rent|eviction/)) {
        newState.flow = 'tenancy';
        newState.category = 'Tenancy & Lease Dispute';
        newState.suggestedDocs = ['Tenancy Agreement', 'Handover condition report'];
      } else if (lowerText.match(/employer|salary|termination|dismissal|cpf/)) {
        newState.flow = 'employment';
        newState.category = 'Employment Dispute';
        newState.suggestedDocs = ['Employment Contract', 'Payslips', 'CPF Statements'];
      } else if (lowerText.match(/divorce|maintenance|child|protection/)) {
        newState.flow = 'family';
        newState.category = 'Family & Matrimonial';
        newState.suggestedDocs = ['Marriage Certificate', 'Relevant Court Orders'];
      } else if (lowerText.match(/vendor|contract|invoice|client|breach/)) {
        newState.flow = 'contract';
        newState.category = 'SME / Contract Dispute';
        newState.suggestedDocs = ['Signed Contract', 'Invoices', 'Correspondence'];
      } else if (lowerText.match(/demand letter|fine|notice|summons/)) {
        newState.flow = 'notice';
        newState.category = 'Formal Notice / Summons';
        newState.suggestedDocs = ['The Notice/Summons Document', 'Prior correspondence'];
      } else {
        newState.flow = 'clarifying';
        newState.category = 'General Inquiry';
      }
    }

    // 2. Extract facts and update urgency
    if (lowerText.match(/urgent|today|tomorrow|deadline|court|summons|eviction/)) {
      newState.urgency = 'High';
      newState.urgencyReason = 'Mention of immediate deadline or severe action.';
    } else if (newState.urgency === 'Pending Assessment' && newState.step > 0) {
      newState.urgency = 'Medium';
      newState.urgencyReason = 'Standard assessment based on initial facts.';
    }

    if (text.length > 5) {
      newState.facts.push({
        text: text.substring(0, 80) + (text.length > 80 ? '...' : ''),
        source: 'From user statement',
        label: 'User-stated'
      });
    }

    const dateMatch = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}|\d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2}\/\d{1,2}\/\d{2,4}/i);
    if (dateMatch) {
      newState.timeline.push(`Event reported around ${dateMatch[0]}`);
    } else if (newState.step === 0) {
      newState.timeline.push('Initial issue reported');
    }

    // 3. Generate next question
    newState.step += 1;

    if (newState.flow === 'tenancy') {
      if (newState.step === 1) {
        aiResponse = "I understand you're dealing with a tenancy issue. To help me assess the situation under Singapore's tenancy context, is there a written tenancy agreement in place?";
        newState.missingInfo.push('Written agreement status');
      } else if (newState.step === 2) {
        aiResponse = "Got it. What exactly is the dispute about? Is it regarding the security deposit, repairs, unpaid rent, or an eviction threat?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Written agreement status');
        newState.missingInfo.push('Core dispute details');
        newState.actionList.push({ action: 'Locate Tenancy Agreement', reason: 'It helps verify the obligations and deposit terms relevant to your dispute.' });
      } else if (newState.step === 3) {
        aiResponse = "I see. Has the landlord or agent given any written explanation or formal notice? Do you have receipts, photos, or chat records to support your position?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Core dispute details');
        newState.missingInfo.push('Evidence availability');
      } else {
        aiResponse = "Thank you for sharing those details. I have enough information to generate a preliminary intake summary for your lawyer. Please review the summary on the right.";
        newState.isComplete = true;
      }
    } else if (newState.flow === 'employment') {
      if (newState.step === 1) {
        aiResponse = "This sounds like an employment matter. Under the Employment Act context, are you the employee or the employer in this situation?";
        newState.missingInfo.push('Party role (Employee/Employer)');
      } else if (newState.step === 2) {
        aiResponse = "Understood. What specifically happened? Are we looking at unpaid salary, unfair dismissal, workplace harassment, or a benefits issue?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Party role (Employee/Employer)');
        newState.missingInfo.push('Specific incident details');
        newState.actionList.push({ action: 'Gather Employment Contract & Payslips', reason: 'Crucial for verifying your employment terms and salary claims.' });
      } else if (newState.step === 3) {
        aiResponse = "Was anything communicated in writing regarding this issue? Also, is there an urgent deadline, or have you already approached TADM (Tripartite Alliance for Dispute Management)?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Specific incident details');
        newState.missingInfo.push('Written communications', 'TADM status');
      } else {
        aiResponse = "Thank you. I've gathered the key facts. I will now finalize your intake summary which you can use for a consultation or when filing a claim.";
        newState.isComplete = true;
      }
    } else if (newState.flow === 'family') {
      if (newState.step === 1) {
        aiResponse = "I'm sorry to hear you're going through this. For family matters in Singapore, what is the main issue: divorce proceedings, child arrangements, maintenance, or personal protection?";
        newState.missingInfo.push('Main family issue');
      } else if (newState.step === 2) {
        aiResponse = "Has any formal court process already started, or are you looking to initiate one? Are there children involved?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Main family issue');
        newState.missingInfo.push('Court process status', 'Children involvement');
        newState.actionList.push({ action: 'Prepare Marriage Certificate & Children\'s Birth Certificates', reason: 'Standard required documents for Family Justice Courts.' });
      } else if (newState.step === 3) {
        aiResponse = "Do you have any formal documents, notices, or evidence of the issues you mentioned (e.g., financial records for maintenance)?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Court process status');
        newState.missingInfo.push('Supporting evidence');
      } else {
        aiResponse = "Thank you for providing this sensitive information. Your intake summary is ready on the right, which will help a family lawyer understand your situation quickly.";
        newState.isComplete = true;
      }
    } else if (newState.flow === 'contract') {
      if (newState.step === 1) {
        aiResponse = "This appears to be a commercial or contract dispute. Is the other party a client, vendor, employee, or business partner?";
        newState.missingInfo.push('Counterparty relationship');
      } else if (newState.step === 2) {
        aiResponse = "Is there a signed agreement or contract in place? What is the core issue: non-payment, breach of terms, delay, or termination?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Counterparty relationship');
        newState.missingInfo.push('Contract status', 'Core breach details');
        newState.actionList.push({ action: 'Organize Invoices and Correspondence', reason: 'Establishes the timeline of the transaction and the dispute.' });
      } else if (newState.step === 3) {
        aiResponse = "Do you have supporting documents like invoices or emails? Is there any immediate financial exposure or deadline pressure we should note?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Contract status');
        newState.missingInfo.push('Financial exposure', 'Deadlines');
      } else {
        aiResponse = "Got it. I have compiled the facts into a structured summary for your commercial dispute. Please review it on the right.";
        newState.isComplete = true;
      }
    } else if (newState.flow === 'notice') {
      if (newState.step === 1) {
        aiResponse = "Receiving a formal notice can be stressful. Who is the notice from, and what exactly are they demanding or alleging?";
        newState.missingInfo.push('Issuing party', 'Demands/Allegations');
      } else if (newState.step === 2) {
        aiResponse = "Is there a specific deadline stated in the document to respond or make payment?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Issuing party');
        newState.missingInfo.push('Response deadline');
        newState.actionList.push({ action: 'Confirm Response Deadline', reason: 'Missing a formal deadline can lead to default judgments or further penalties.' });
      } else if (newState.step === 3) {
        aiResponse = "Do you have any documents or evidence that contradict their claims? What outcome are you hoping for?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Response deadline');
        newState.missingInfo.push('Defense evidence', 'Desired outcome');
      } else {
        aiResponse = "Thank you. I've assessed the notice details. Your intake summary is prepared and ready for a lawyer's review.";
        newState.isComplete = true;
      }
    } else {
      if (newState.step === 1) {
        aiResponse = "To help me understand the legal context better, who is the other party involved in this situation?";
        newState.missingInfo.push('Other party identity');
      } else if (newState.step === 2) {
        aiResponse = "What exactly happened leading up to this point?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Other party identity');
        newState.missingInfo.push('Sequence of events');
      } else if (newState.step === 3) {
        aiResponse = "What outcome are you hoping for, and do you have any documents to support your version of events?";
        newState.missingInfo = newState.missingInfo.filter(i => i !== 'Sequence of events');
        newState.missingInfo.push('Desired outcome', 'Supporting documents');
      } else {
        aiResponse = "Thank you for clarifying. I've put together a preliminary summary of your situation on the right.";
        newState.isComplete = true;
      }
    }

    setIntakeState(newState);
    
    if (newState.isComplete) {
      setTriageSummary({
        caseType: newState.category,
        urgency: newState.urgency,
        nextSteps: newState.actionList.map(a => a.action),
        missingInfo: newState.missingInfo,
        lawyerAdvisable: 'Recommended based on intake'
      });
    }

    setChatHistory(prev => [...prev, { role: 'ai', type: 'text', text: aiResponse }]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');
    
    setChatHistory(prev => [...prev, { role: 'user', type: 'text', text: userText }]);
    setIsAnalyzing(true);

    setTimeout(() => {
      processSimulatedChat(userText);
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleEarlyAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEarlyAccessSubmitted(true);
    setTimeout(() => setEarlyAccessSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-purple-100/50 shadow-[0_4px_30px_rgba(147,51,234,0.05)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_4px_12px_rgba(147,51,234,0.3)]">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Lion LawSense</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#demo" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-purple-700 bg-purple-50/80 border border-purple-200/60 hover:bg-purple-100 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
                <Sparkles className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                Try Demo
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#about-us" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#services" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors relative group">
                Services & Partners
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors relative group">
                FAQ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-purple-700 bg-white/50 hover:bg-purple-50/80 border border-slate-200/60 hover:border-purple-200/80 rounded-full transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 group">
                <User className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                Login / Signup
              </a>
              <a href="#early-access" className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full transition-all shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)] hover:-translate-y-0.5">
                Early Access
              </a>
            </div>

            <button 
              className="md:hidden p-2 text-slate-500 hover:text-purple-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-xl shadow-lg"
            >
              <div className="px-4 py-6 space-y-4 flex flex-col">
                <a href="#demo" onClick={() => setIsMobileMenuOpen(false)} className="inline-flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-purple-700 bg-purple-50/80 border border-purple-200/60 hover:bg-purple-100 rounded-xl transition-all shadow-sm">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Try Demo
                </a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-purple-600 transition-colors">How It Works</a>
                <a href="#about-us" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-purple-600 transition-colors">About Us</a>
                <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-purple-600 transition-colors">Services & Partners</a>
                <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-slate-600 hover:text-purple-600 transition-colors">FAQ</a>
                <a href="#login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-slate-700 bg-slate-50 border border-slate-200/60 rounded-xl transition-colors">
                  <User className="w-5 h-5 text-slate-400" />
                  Login / Signup
                </a>
                <a href="#early-access" onClick={() => setIsMobileMenuOpen(false)} className="px-5 py-3 text-center text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] transition-all">
                  Early Access
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-36 pb-24 lg:pt-52 lg:pb-32 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_60%)] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50/80 backdrop-blur-sm border border-purple-200/60 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Singapore Beta Now Open
            </div>
            <h1 className="text-5xl lg:text-7xl font-semibold text-slate-900 leading-[1.05] tracking-tight mb-6">
              Clarity Before the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Consultation</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed font-light">
              Upload your legal document or describe your issue. Our AI organizes the facts, highlights key risks, and prepares a clear brief for you and your lawyer—saving you time and money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full shadow-[0_8px_30px_rgb(147,51,234,0.2)] hover:shadow-[0_8px_40px_rgb(147,51,234,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                Try Free Demo
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#early-access" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
                Join Early Access
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/30 to-indigo-400/30 rounded-[2.5rem] blur-3xl opacity-70" />
            <div className="relative bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Who Lion LawSense Helps
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  Built for Singapore
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(147,51,234,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Header Image/Illustration Area */}
                  <div className="h-28 bg-gradient-to-br from-purple-100/80 to-purple-50/50 relative overflow-hidden border-b border-purple-100/50">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-200/50 rounded-full blur-xl group-hover:bg-purple-300/50 transition-colors duration-500" />
                    <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-indigo-200/40 rounded-full blur-lg group-hover:bg-indigo-300/50 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                        <User className="w-6 h-6 text-purple-600 relative z-10" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 relative z-10">
                    <h4 className="font-semibold text-slate-900 text-[15px] mb-4 group-hover:text-purple-700 transition-colors leading-tight">Self-Represented Individuals</h4>
                    
                    <ul className="space-y-2.5 mb-6 flex-1">
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 font-light">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <span>Small Claims</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 font-light">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <span>Tenancy Issues</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 font-light">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <span>Employment Disputes</span>
                      </li>
                    </ul>

                    <button className="w-full py-2.5 px-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-100/50 rounded-xl transition-colors flex items-center justify-center gap-1.5 group/btn mt-auto shadow-sm">
                      Learn More
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(79,70,229,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Header Image/Illustration Area */}
                  <div className="h-28 bg-gradient-to-br from-indigo-100/80 to-indigo-50/50 relative overflow-hidden border-b border-indigo-100/50">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-200/50 rounded-full blur-xl group-hover:bg-indigo-300/50 transition-colors duration-500" />
                    <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-200/40 rounded-full blur-lg group-hover:bg-blue-300/50 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(79,70,229,0.1)] flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10" />
                        <Building2 className="w-6 h-6 text-indigo-600 relative z-10" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 relative z-10">
                    <h4 className="font-semibold text-slate-900 text-[15px] mb-4 group-hover:text-indigo-700 transition-colors leading-tight">SMEs & Startups</h4>
                    
                    <ul className="space-y-2.5 mb-6 flex-1">
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 font-light">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Contracts & Agreements</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 font-light">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Vendor Disputes</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 font-light">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Compliance & Debt</span>
                      </li>
                    </ul>

                    <button className="w-full py-2.5 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/50 rounded-xl transition-colors flex items-center justify-center gap-1.5 group/btn mt-auto shadow-sm">
                      Learn More
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive MVP Demo */}
      <section id="demo" className="py-28 lg:py-32 bg-gradient-to-b from-purple-50/40 via-purple-50/10 to-white border-t border-purple-100/50 shadow-[inset_0_2px_20px_rgba(147,51,234,0.03)] overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.08),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">Experience the Triage</h2>
            <p className="text-lg text-slate-500 font-light">Upload a document or describe your issue to see how our AI structures your legal matter.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white/60 backdrop-blur-2xl border border-white/50 rounded-full p-1.5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] relative">
              {['chatbot', 'teleconsult'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabSwitch(tab as 'chatbot' | 'teleconsult')}
                  className={`relative px-8 py-3 text-sm font-semibold rounded-full transition-all duration-300 z-10 ${
                    activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab === 'chatbot' ? 'AI Chatbot' : 'Teleconsultation'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Left Side: Chat Interface or Teleconsult Form */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-[0_8px_40px_rgb(147,51,234,0.08)]">
              {activeTab === 'chatbot' ? (
                <>
                  <div className="p-6 border-b border-slate-200 bg-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Lion LawSense AI</h3>
                      <p className="text-sm text-slate-500 font-light">Legal Triage Assistant</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                    <AnimatePresence mode="popLayout">
                      {chatHistory.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.type === 'text' ? (
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              {msg.role === 'ai' ? (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                  <Scale className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                                  <User className="w-4 h-4 text-slate-500" />
                                </div>
                              )}
                              <div className={`rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                                msg.role === 'user' 
                                  ? 'bg-purple-600 text-white rounded-tr-sm' 
                                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-3 max-w-[85%] flex-row-reverse">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                                <User className="w-4 h-4 text-slate-500" />
                              </div>
                              <div className="rounded-2xl p-4 bg-white border border-slate-200 text-slate-900 rounded-tr-sm flex flex-col gap-3 shadow-sm w-64">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div className="overflow-hidden flex-1">
                                    <p className="text-sm font-medium truncate text-slate-900">{msg.file.name}</p>
                                    <p className="text-xs text-slate-500">{msg.file.size}</p>
                                  </div>
                                </div>
                                {isUploading && i === chatHistory.length - 1 && (
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <motion.div 
                                      className="bg-purple-600 h-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress}%` }}
                                      transition={{ duration: 0.1 }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      <div ref={chatEndRef} />
                      {isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex justify-start"
                        >
                          <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                              <Scale className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3 shadow-sm">
                              <div className="flex gap-1.5">
                                <motion.div className="w-1.5 h-1.5 rounded-full bg-purple-500" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                                <motion.div className="w-1.5 h-1.5 rounded-full bg-purple-500" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                                <motion.div className="w-1.5 h-1.5 rounded-full bg-purple-500" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                              </div>
                              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                Analyzing issue...
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-4 border-t border-slate-200 bg-white">
                    <form onSubmit={handleSendMessage} className="relative flex items-center group">
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={isAnalyzing}
                      />
                      <label 
                        htmlFor="document-upload"
                        className="absolute left-3 p-2 text-slate-400 hover:text-purple-600 cursor-pointer transition-colors z-10 bg-white rounded-lg"
                        title="Upload Document"
                      >
                        <FileText className="w-5 h-5" />
                      </label>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your legal issue or upload a document..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-14 pr-14 text-[15px] text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm placeholder:text-slate-400"
                        disabled={isAnalyzing}
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isAnalyzing}
                        className="absolute right-3 p-2 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg disabled:opacity-50 disabled:from-purple-600 disabled:to-indigo-600 transition-all shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full bg-white">
                  <div className="p-6 md:p-8 border-b border-slate-200 bg-white">
                    <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Request Teleconsultation</h3>
                    <p className="text-slate-500 mt-2 font-light">Connect with a specialized lawyer in minutes.</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/50">
                    {/* Progress Indicator */}
                    <div className="mb-12 relative max-w-md mx-auto">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 rounded-full -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full -translate-y-1/2 z-0 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                        style={{ width: `${((teleconsultStep - 1) / 4) * 100}%` }}
                      />
                      <div className="flex items-center justify-between relative z-10">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div 
                            key={step} 
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                              teleconsultStep === step 
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-110 border-2 border-white' 
                                : teleconsultStep > step 
                                  ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-2 border-white shadow-sm' 
                                  : 'bg-white text-slate-400 border-2 border-slate-200'
                            }`}
                          >
                            {teleconsultStep > step ? <Check className="w-5 h-5" /> : step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form Steps */}
                    <div className="max-w-md mx-auto">
                      <AnimatePresence mode="wait">
                        {teleconsultStep === 1 && (
                          <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">What is your legal issue?</h4>
                            <div className="grid gap-3">
                              {['Tenancy & Property', 'Fines & Regulatory', 'Commercial Contracts', 'Personal Injury', 'Other'].map((category) => (
                                <button
                                  key={category}
                                  onClick={() => setTeleconsultData({ ...teleconsultData, issueCategory: category })}
                                  className={`p-5 text-left rounded-2xl border transition-all duration-300 ${
                                    teleconsultData.issueCategory === category 
                                      ? 'border-purple-500 bg-purple-50/50 shadow-md ring-1 ring-purple-500/20 scale-[1.02]' 
                                      : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm hover:bg-slate-50'
                                  }`}
                                >
                                  <span className={`font-medium text-[15px] ${teleconsultData.issueCategory === category ? 'text-purple-900' : 'text-slate-700'}`}>
                                    {category}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {teleconsultStep === 2 && (
                          <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">Briefly describe your situation</h4>
                            <textarea
                              value={teleconsultData.description}
                              onChange={(e) => setTeleconsultData({ ...teleconsultData, description: e.target.value })}
                              placeholder="E.g., My landlord is withholding my deposit without a valid reason..."
                              className="w-full h-48 p-5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 resize-none transition-all shadow-sm text-slate-700 placeholder:text-slate-400 text-[15px] leading-relaxed"
                            />
                          </motion.div>
                        )}

                        {teleconsultStep === 3 && (
                          <motion.div 
                            key="step3"
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">Upload supporting documents <span className="text-slate-400 font-normal text-base">(Optional)</span></h4>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer bg-white group shadow-sm">
                              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-purple-100 transition-colors shadow-sm">
                                <FileText className="w-8 h-8 text-slate-400 group-hover:text-purple-600 transition-colors" />
                              </div>
                              <p className="text-base font-medium text-slate-900 mb-1.5">Click to upload or drag and drop</p>
                              <p className="text-sm text-slate-500 font-light">PDF, DOCX up to 10MB</p>
                            </div>
                          </motion.div>
                        )}

                        {teleconsultStep === 4 && (
                          <motion.div 
                            key="step4"
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">How urgent is this matter?</h4>
                            <div className="grid gap-3">
                              {[
                                { level: 'Low', desc: 'No immediate deadlines' },
                                { level: 'Medium', desc: 'Action needed within 1-2 weeks' },
                                { level: 'High', desc: 'Immediate action required (e.g., court deadline)' }
                              ].map(({ level, desc }) => (
                                <button
                                  key={level}
                                  onClick={() => setTeleconsultData({ ...teleconsultData, urgency: level })}
                                  className={`p-5 text-left rounded-2xl border transition-all duration-300 ${
                                    teleconsultData.urgency === level 
                                      ? 'border-purple-500 bg-purple-50/50 shadow-md ring-1 ring-purple-500/20 scale-[1.02]' 
                                      : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm hover:bg-slate-50'
                                  }`}
                                >
                                  <div className={`font-semibold mb-1 text-[15px] ${teleconsultData.urgency === level ? 'text-purple-900' : 'text-slate-900'}`}>{level}</div>
                                  <div className={`text-sm font-light ${teleconsultData.urgency === level ? 'text-purple-700/80' : 'text-slate-500'}`}>{desc}</div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {teleconsultStep === 5 && (
                          <motion.div 
                            key="step5"
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">Preferred consultation time</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {['Morning (9AM - 12PM)', 'Afternoon (12PM - 5PM)', 'Evening (5PM - 8PM)', 'Anytime'].map((time) => (
                                <button
                                  key={time}
                                  onClick={() => setTeleconsultData({ ...teleconsultData, preferredTime: time })}
                                  className={`p-5 text-center rounded-2xl border transition-all duration-300 ${
                                    teleconsultData.preferredTime === time 
                                      ? 'border-purple-500 bg-purple-50/50 shadow-md ring-1 ring-purple-500/20 scale-[1.02]' 
                                      : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm hover:bg-slate-50'
                                  }`}
                                >
                                  <span className={`text-[15px] font-medium ${teleconsultData.preferredTime === time ? 'text-purple-900' : 'text-slate-700'}`}>{time}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 border-t border-slate-200 bg-white/80 backdrop-blur-xl">
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => setTeleconsultStep(Math.max(1, teleconsultStep - 1))}
                        className={`h-[46px] px-6 text-sm font-medium text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50/50 rounded-xl transition-all shadow-sm flex items-center justify-center ${teleconsultStep === 1 ? 'invisible' : ''}`}
                      >
                        Back
                      </button>
                      
                      <div className="flex items-start gap-4">
                        {teleconsultStep === 5 && (
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={handleUrgentCall}
                              className="h-[46px] px-6 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] flex items-center justify-center gap-2 group overflow-hidden hover:-translate-y-0.5"
                            >
                              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <Phone className="w-4 h-4 relative z-10 animate-pulse" />
                              <span className="relative z-10">Call Now (Urgent)</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-medium w-[180px] text-center leading-tight">
                              For urgent legal situations requiring immediate assistance
                            </span>
                          </div>
                        )}
                        
                        {teleconsultStep < 5 ? (
                          <button
                            onClick={() => setTeleconsultStep(Math.min(5, teleconsultStep + 1))}
                            disabled={
                              (teleconsultStep === 1 && !teleconsultData.issueCategory) ||
                              (teleconsultStep === 2 && !teleconsultData.description.trim()) ||
                              (teleconsultStep === 4 && !teleconsultData.urgency)
                            }
                            className="h-[46px] px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)] hover:-translate-y-0.5"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowLawyerModal(true)}
                            disabled={!teleconsultData.preferredTime}
                            className="h-[46px] px-8 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5"
                          >
                            Schedule Consultation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel */}
            <div className="flex flex-col gap-6 h-[650px]">
              <AnimatePresence mode="wait">
                {activeTab === 'chatbot' ? (
                  intakeState.step > 0 ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-[0_8px_40px_rgb(147,51,234,0.08)] flex-1 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          <h3 className="text-lg font-medium text-slate-900">Intake Summary</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase ${
                          intakeState.urgency === 'Critical' ? 'bg-purple-500/20 border-red-500/30 text-purple-500' :
                          intakeState.urgency === 'High' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                          intakeState.urgency === 'Medium' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600' :
                          'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {intakeState.urgency}
                        </span>
                      </div>

                      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Status Label */}
                        <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          {intakeState.isComplete ? 'Intake Complete' : 'Collecting case facts...'}
                        </div>

                        {/* Category */}
                        <div className="bg-white/50 rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-600" />
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Likely Legal Category</p>
                          <p className="text-base text-slate-900 font-medium">{intakeState.category}</p>
                        </div>

                        {/* Facts Collected */}
                        {intakeState.facts.length > 0 && (
                          <div className="bg-white/30 rounded-xl p-4 border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-500" /> Facts Collected
                            </p>
                            <ul className="space-y-3">
                              {intakeState.facts.map((fact, i) => (
                                <li key={i} className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{fact.label}</span>
                                    <span className="text-[10px] text-slate-400">{fact.source}</span>
                                  </div>
                                  <span className="leading-relaxed">{fact.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Missing Information */}
                        {intakeState.missingInfo.length > 0 && (
                          <div className="bg-white/30 rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-500" /> Information Gaps
                            </p>
                            <ul className="space-y-2">
                              {intakeState.missingInfo.map((info, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 shrink-0 mt-2" />
                                  <span className="leading-relaxed">{info}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action List */}
                        {intakeState.actionList.length > 0 && (
                          <div className="bg-white/30 rounded-xl p-4 border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dynamic Action List
                            </p>
                            <ul className="space-y-3">
                              {intakeState.actionList.map((action, i) => (
                                <li key={i} className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                  <p className="font-medium text-slate-900 mb-1">{action.action}</p>
                                  <p className="text-xs text-slate-500">{action.reason}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Timeline */}
                        {intakeState.timeline.length > 0 && (
                          <div className="bg-white/30 rounded-xl p-4 border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" /> Automated Chronology
                            </p>
                            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                              {intakeState.timeline.map((event, i) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-blue-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2 rounded border border-slate-200 bg-white shadow-sm">
                                    <div className="text-xs text-slate-600">{event}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA Buttons */}
                        {intakeState.isComplete && (
                          <div className="pt-4 flex flex-col gap-3">
                            <button 
                              onClick={() => setIsPacketModalOpen(true)}
                              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)] transition-all flex items-center justify-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              View Full Summary
                            </button>
                            <button 
                              onClick={() => setShowLawyerModal(true)}
                              className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <Briefcase className="w-4 h-4" />
                              Continue to Teleconsultation
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_8px_40px_rgb(147,51,234,0.08)]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.05),transparent_70%)]" />
                      <div className="w-20 h-20 rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgba(147,51,234,0.08)] flex items-center justify-center mb-6 relative z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                        <div className="absolute inset-0 rounded-[2rem] border border-purple-500/20 animate-ping opacity-20" />
                        <MessageSquare className="w-10 h-10 text-purple-400 relative z-10" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-900 mb-3 z-10">Intake in progress</h3>
                      <p className="text-sm text-slate-500 max-w-sm leading-relaxed z-10">
                        Describe your legal issue to generate a structured intake summary, identify critical deadlines, and prepare an action plan.
                      </p>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="teleconsult-info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-8 flex-1 flex flex-col shadow-[0_8px_40px_rgb(147,51,234,0.08)]"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                      <div className="w-10 h-10 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                        <Info className="w-5 h-5 text-purple-600 relative z-10" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-900">What happens next?</h3>
                    </div>
                    
                    <div className="space-y-8 flex-1">
                      <div className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                            <span className="text-sm font-bold text-purple-600 relative z-10">1</span>
                          </div>
                          <div className="w-0.5 h-full bg-gradient-to-b from-purple-100 to-transparent my-2" />
                        </div>
                        <div className="pb-6">
                          <h4 className="text-base font-medium text-slate-900 mb-1 group-hover:text-purple-700 transition-colors">Smart Matching</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            Our system analyzes your issue and matches you with a specialized lawyer from our network who has expertise in your specific case type.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                            <span className="text-sm font-bold text-purple-600 relative z-10">2</span>
                          </div>
                          <div className="w-0.5 h-full bg-gradient-to-b from-purple-100 to-transparent my-2" />
                        </div>
                        <div className="pb-6">
                          <h4 className="text-base font-medium text-slate-900 mb-1 group-hover:text-purple-700 transition-colors">Summary Preparation</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            We automatically generate a structured brief of your situation, saving you time and ensuring the lawyer is fully prepared before the call.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                            <span className="text-sm font-bold text-purple-600 relative z-10">3</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-slate-900 mb-1 group-hover:text-purple-700 transition-colors">Lawyer Review & Call</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            The matched lawyer reviews your brief and connects with you at your preferred time for a focused, productive consultation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-200">
                      <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">100% Confidential</p>
                          <p className="text-xs text-slate-500 mt-1">Your information is securely encrypted and only shared with your matched lawyer.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 bg-purple-50 border border-slate-200 text-slate-900 px-6 py-3 rounded-full shadow-2xl"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium">Consultation-ready packet prepared successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lawyer Booking Modal */}
      <AnimatePresence>
        {showLawyerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLawyerModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-slate-200 flex justify-between items-start bg-gradient-to-b from-zinc-800/50 to-transparent relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Scale className="w-32 h-32 text-slate-900" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-bold tracking-widest uppercase mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    Next Step
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-2 tracking-tight">Book Consultation</h3>
                  <p className="text-sm text-slate-500 font-medium">Connect with a specialized lawyer to review your packet.</p>
                </div>
                <button 
                  onClick={() => setShowLawyerModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-white/10 relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="bg-white/50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4 relative z-10">Recommended Specialist</p>
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
                      <Briefcase className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-2">
                        {triageSummary?.caseType.includes('Tenancy') ? 'Property & Real Estate Lawyer' :
                         triageSummary?.caseType.includes('Fine') ? 'Regulatory & Compliance Lawyer' :
                         triageSummary?.caseType.includes('Contract') ? 'Commercial Disputes Lawyer' :
                         'Civil Litigation Lawyer'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Available this week
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-purple-50 text-slate-600 border border-slate-200">
                          Fixed Fee Options
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900">How it works</h4>
                  <ul className="space-y-4">
                    {[
                      { icon: FileText, text: 'Your generated packet is securely shared with the lawyer.' },
                      { icon: Clock, text: 'The lawyer reviews your facts before the meeting, saving billable time.' },
                      { icon: MessageSquare, text: 'You get actionable advice focused on your specific questions.' }
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          <step.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="pt-1.5 leading-relaxed">{step.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 sm:p-8 border-t border-slate-200 bg-white shrink-0">
                <button 
                  onClick={() => {
                    setShowLawyerModal(false);
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-base font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(147,51,234,0.4)] hover:shadow-[0_8px_30px_rgba(147,51,234,0.6)] flex items-center justify-center gap-2"
                >
                  Request Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">No payment required to request.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 lg:py-32 bg-white border-t border-slate-100 shadow-[inset_0_2px_20px_rgba(0,0,0,0.01)] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.05),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">How Lion LawSense Works</h2>
            <p className="text-slate-500 text-lg md:text-xl font-light">See how Lion LawSense guides you from identifying your legal issue to connecting with the right lawyer.</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-14 left-[10%] right-[10%] h-[2px] bg-purple-100/50">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>

            <div className="grid lg:grid-cols-5 gap-10 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Describe Your Issue',
                  desc: 'Users briefly explain their situation or upload a relevant document (e.g., a contract or demand letter).',
                  icon: MessageSquare
                },
                {
                  step: '02',
                  title: 'AI Triage & Analysis',
                  desc: 'Our AI instantly analyzes the facts, identifies key legal issues, and highlights potential risks.',
                  icon: ShieldCheck
                },
                {
                  step: '03',
                  title: 'Generate Consultation Packet',
                  desc: 'A structured, easy-to-read brief is created, summarizing the case, timeline, and missing information.',
                  icon: FileSearch
                },
                {
                  step: '04',
                  title: 'Review & Prepare',
                  desc: 'You review the packet to understand your position and gather any missing documents before meeting a lawyer.',
                  icon: FileText
                },
                {
                  step: '05',
                  title: 'Connect with a Lawyer',
                  desc: 'Share your structured packet with a specialized partner lawyer for a highly efficient, focused consultation.',
                  icon: Users
                }
              ].map((item, i) => (
                <div key={i} className="relative group flex flex-col items-center text-center">
                  {/* Connecting Line (Mobile) */}
                  {i !== 4 && (
                    <div className="lg:hidden absolute top-28 left-1/2 w-[2px] h-20 bg-purple-100/50 -z-10">
                      <motion.div 
                        className="absolute top-0 inset-x-0 bg-gradient-to-b from-purple-400 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                        initial={{ height: "0%" }}
                        whileInView={{ height: "100%" }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                      />
                    </div>
                  )}
                  
                  <div className="w-28 h-28 rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgba(147,51,234,0.06)] flex items-center justify-center mb-8 relative group-hover:border-purple-200 group-hover:shadow-[0_12px_40px_rgba(147,51,234,0.15)] group-hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
                    <div className="absolute -top-4 -right-4 w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm flex items-center justify-center text-sm font-bold text-purple-600 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 z-10">
                      {item.step}
                    </div>
                    <item.icon className="w-10 h-10 text-purple-600 relative z-10 group-hover:scale-110 transition-all duration-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-purple-700 transition-colors duration-300">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-light px-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about-us" className="py-28 lg:py-32 bg-gradient-to-b from-purple-50/40 via-purple-50/10 to-white border-t border-purple-100/50 shadow-[inset_0_2px_20px_rgba(147,51,234,0.03)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.08),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">About Us</h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
              At Lion LawSense, we believe legal help in Singapore should be clearer, faster, and more accessible. Our platform bridges the gap between users seeking legal clarity and the legal professionals who can support them, using AI-guided triage, consultation readiness, and trusted legal partnerships.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Transparency First', desc: 'Clear expectations, structured case intake, and better visibility into what happens next before you ever pay a consultation fee.', icon: Scale },
              { title: 'Empowering Users', desc: 'Understand your rights, obligations, and next steps with confidence through next-generation AI guidance and trusted legal partner support.', icon: ShieldCheck },
              { title: 'Smart Legal Guidance', desc: 'Receive structured guidance, legal education, and next-step recommendations through AI-assisted analysis and expert legal partnerships.', icon: Compass }
            ].map((value, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(147,51,234,0.12)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center mb-8 relative overflow-hidden group-hover:scale-110 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                    <value.icon className="w-8 h-8 text-purple-600 relative z-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">{value.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-light">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-28 lg:py-32 bg-white border-t border-slate-100 shadow-[inset_0_2px_20px_rgba(0,0,0,0.01)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Services Subsection */}
          <div>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">Our Services</h2>
              <p className="text-slate-500 text-lg md:text-xl font-light">
                Comprehensive legal support from initial triage to professional consultation.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(147,51,234,0.12)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center mb-8 relative overflow-hidden group-hover:scale-110 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                    <Bot className="w-8 h-8 text-purple-600 relative z-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-6 group-hover:text-purple-700 transition-colors">AI Legal Triage</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Instantly understand your legal issue</span>
                    </li>
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Identify case type and urgency</span>
                    </li>
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Get clear next steps</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Service 2 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(147,51,234,0.12)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center mb-8 relative overflow-hidden group-hover:scale-110 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                    <FileText className="w-8 h-8 text-purple-600 relative z-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-6 group-hover:text-purple-700 transition-colors">Consultation Readiness</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Structured case summary</span>
                    </li>
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Timeline and document checklist</span>
                    </li>
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Reduce back-and-forth with lawyers</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Service 3 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(147,51,234,0.12)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center mb-8 relative overflow-hidden group-hover:scale-110 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                    <Users className="w-8 h-8 text-purple-600 relative z-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-6 group-hover:text-purple-700 transition-colors">Personalised Support</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Tailored guidance based on user issue and context</span>
                    </li>
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Personalized information and next steps</span>
                    </li>
                    <li className="flex items-start gap-4 text-slate-600 font-light">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Connect users to the right expert legal partner</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Network */}
      <section id="lawyers" className="py-28 lg:py-32 bg-gradient-to-b from-purple-50/40 via-purple-50/10 to-white border-t border-purple-100/50 shadow-[inset_0_2px_20px_rgba(147,51,234,0.03)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">Our Legal Network</h2>
              <p className="text-slate-500 text-lg md:text-xl font-light mb-4">
                We collaborate with trusted Singapore law firms and independent legal professionals to support a wide range of legal needs.
              </p>
            </div>

            {/* Partner Law Firms */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Featured Partner Firms
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    name: 'Apex Law LLC',
                    type: 'Full-Service Law Firm',
                    specialization: 'Corporate & Commercial, Dispute Resolution',
                    badges: ['SME Focus', 'Tech Startups']
                  },
                  {
                    name: 'Vanguard Legal Partners',
                    type: 'Boutique Law Firm',
                    specialization: 'Employment, Family & Private Wealth',
                    badges: ['Private Clients', 'Mediation']
                  }
                ].map((firm, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-6 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_8px_30px_rgb(147,51,234,0.08)] shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 flex flex-col sm:flex-row gap-6 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row gap-6 w-full">
                      <div className="absolute top-0 right-0 flex items-center gap-1 bg-emerald-50/80 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide uppercase border border-emerald-100/50 shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Partner</span>
                      </div>
                      
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/50 flex items-center justify-center shrink-0 group-hover:border-purple-200 transition-colors shadow-sm">
                        <Building2 className="w-8 h-8 text-slate-400 group-hover:text-purple-500 transition-colors" />
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-purple-700 transition-colors mb-1">{firm.name}</h3>
                        <p className="text-xs font-medium text-purple-600/80 mb-3">{firm.type}</p>
                        
                        <div className="flex items-start gap-2 text-sm text-slate-600 mb-4">
                          <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{firm.specialization}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100">
                          {firm.badges.map((badge, j) => (
                            <span key={j} className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-50 text-slate-600 border border-slate-200/60 shadow-sm">
                              {badge}
                            </span>
                          ))}
                          <button className="ml-auto text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group/btn">
                            View Firm
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Independent Professionals */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Independent Legal Professionals
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  name: 'Rachel Tan',
                  firm: 'Tan & Associates LLC',
                  type: 'Law Firm Partner',
                  specialization: 'Property Disputes',
                  experience: '12 years',
                  badges: ['Tenant Disputes', 'Small Claims']
                },
                {
                  name: 'Marcus Lim',
                  firm: 'Lim & Partners',
                  type: 'Law Firm Partner',
                  specialization: 'Civil Litigation',
                  experience: '15 years',
                  badges: ['Civil Litigation', 'Contract Review']
                },
                {
                  name: 'Sarah Wong',
                  firm: 'Wong Legal LLC',
                  type: 'Independent Partner',
                  specialization: 'Employment Law',
                  experience: '10 years',
                  badges: ['Employment Law', 'Contract Review']
                },
                {
                  name: 'Daniel Koh',
                  firm: 'Koh & Co Legal',
                  type: 'Law Firm Partner',
                  specialization: 'SME Commercial Contracts',
                  experience: '14 years',
                  badges: ['SME Commercial Contracts', 'Small Claims']
                }
              ].map((lawyer, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_12px_40px_rgb(147,51,234,0.12)] transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Verified Partner Badge */}
                    <div className="absolute top-0 right-0 flex items-center gap-1 bg-emerald-50/80 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide uppercase border border-emerald-100/50 shadow-sm">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4 mt-1">
                      <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center shrink-0 overflow-hidden group-hover:border-indigo-500/30 transition-colors relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                        <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-500/60 transition-colors relative z-10" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{lawyer.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{lawyer.firm}</p>
                        <p className="text-[10px] text-purple-600/80 font-medium mt-0.5">{lawyer.type}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{lawyer.specialization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{lawyer.experience} experience</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {lawyer.badges.map((badge, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-slate-50 text-slate-600 border border-slate-200/60 shadow-sm">
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button className="py-2.5 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors text-center shadow-sm">
                        Profile
                      </button>
                      <button className="py-2.5 px-3 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all text-center shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)]">
                        Consult
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <button className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors group">
                Show more partners
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="py-28 lg:py-32 bg-white border-t border-slate-100 shadow-[inset_0_2px_20px_rgba(0,0,0,0.01)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.03),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-lg md:text-xl text-slate-500 font-light">Everything you need to know about the product and billing.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Is Lion LawSense a law firm?", a: "No, Lion LawSense is a legal technology platform. We provide AI-guided triage and connect you with independent law firms and legal professionals in Singapore." },
              { q: "Does Lion LawSense provide legal advice?", a: "Our AI provides legal information, education, and triage. It does not provide formal legal advice. For legal advice, you will be connected to a qualified lawyer through our platform." },
              { q: "Who is this platform for?", a: "Lion LawSense is designed for individuals, self-represented litigants, startups, and SMEs in Singapore seeking clear, accessible, and efficient legal support." },
              { q: "What kinds of legal issues can Lion LawSense help with?", a: "We cover a wide range of issues including civil litigation, employment disputes, family law, property matters, and SME commercial contracts." },
              { q: "How does the AI chatbot work?", a: "Our AI analyzes your legal query, identifies the core issues, determines urgency, and provides a structured summary to help you understand your situation before speaking to a lawyer." },
              { q: "What happens during teleconsultation?", a: "You'll have a secure video or audio call with a verified lawyer. They will review your AI-generated case summary beforehand, ensuring the consultation is focused and efficient." },
              { q: "Can I upload legal documents securely?", a: "Yes. You can upload documents during the triage process. Our platform uses enterprise-grade encryption to ensure your sensitive information remains secure and confidential." },
              { q: "How does lawyer matching work?", a: "Based on your specific legal issue, urgency, and budget, our system matches you with the most suitable verified legal professionals from our network." },
              { q: "Is Lion LawSense suitable for SMEs and startups?", a: "Absolutely. We have specialized partners who focus on commercial contracts, intellectual property, and corporate compliance tailored for SMEs." },
              { q: "What if my issue is urgent?", a: "If you have an emergency, you can use the 'Call Now (Urgent)' feature to be connected to the next available legal professional immediately." }
            ].map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white/80 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-300 relative group ${openFaqIndex === index ? 'border-purple-200 shadow-[0_12px_40px_rgb(147,51,234,0.12)]' : 'border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-purple-200/50 hover:shadow-[0_12px_40px_rgb(147,51,234,0.12)] hover:-translate-y-0.5'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 ${openFaqIndex === index ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none relative z-10"
                >
                  <span className={`text-lg font-medium transition-colors duration-300 pr-8 ${openFaqIndex === index ? 'text-purple-700' : 'text-slate-900 group-hover:text-purple-600'}`}>
                    {faq.q}
                  </span>
                  <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(147,51,234,0.05)] relative overflow-hidden bg-white/60 backdrop-blur-md ${openFaqIndex === index ? 'border border-purple-200/80' : 'border border-slate-200/80 group-hover:border-purple-200/80'}`}>
                    <div className={`absolute inset-0 transition-opacity duration-300 ${openFaqIndex === index ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-100' : 'bg-gradient-to-br from-slate-500/5 to-slate-500/5 opacity-100 group-hover:opacity-0'}`} />
                    <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 transition-opacity duration-300 ${openFaqIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    <ChevronDown className={`w-5 h-5 relative z-10 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 text-purple-600' : 'text-slate-400 group-hover:text-purple-500'}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="relative z-10"
                    >
                      <div className="px-8 pb-6 text-slate-600 font-light leading-relaxed border-t border-slate-100/50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access */}
      <section id="early-access" className="py-28 lg:py-32 bg-gradient-to-b from-purple-50/50 via-purple-50/20 to-purple-100/30 border-t border-purple-200/60 shadow-[inset_0_2px_20px_rgba(147,51,234,0.05)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.05),transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">Join the Singapore Beta</h2>
          <p className="text-slate-600 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light">
            Get priority access to Lion LawSense and experience a smarter way to handle your legal issues.
          </p>
          
          <form onSubmit={handleEarlyAccessSubmit} className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] shadow-[0_8px_30px_rgba(147,51,234,0.1)] border border-purple-100 flex flex-col sm:flex-row gap-2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-[2rem] -z-10" />
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="flex-1 bg-transparent border-none py-4 px-6 text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-400 font-light"
            />
            <button 
              type="submit" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-3xl transition-all duration-300 shadow-[0_4px_20px_rgba(147,51,234,0.4)] hover:shadow-[0_8px_30px_rgba(147,51,234,0.6)]"
            >
              Get Access
            </button>
          </form>
          
          <AnimatePresence>
            {earlyAccessSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 inline-flex items-center gap-3 text-emerald-700 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium tracking-wide">Thanks! We'll be in touch soon.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Consultation-Ready Packet Modal */}
      <AnimatePresence>
        {isPacketModalOpen && triageSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl max-h-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative border border-white/50"
            >
              {/* Sticky Top Bar */}
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(147,51,234,0.1)] flex items-center justify-center shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                    <FileText className="w-6 h-6 text-purple-600 relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Consultation-Ready Packet</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1 font-light">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Prepared for lawyer consultation
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleDownloadPacket}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span> Packet
                  </button>
                  <button 
                    onClick={() => {
                      setIsPacketModalOpen(false);
                      setShowLawyerModal(true);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)]"
                  >
                    <Calendar className="w-4 h-4" />
                    Request Consultation
                  </button>
                  <button 
                    onClick={() => setIsPacketModalOpen(false)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6 md:p-10 space-y-10 bg-slate-50/30">
                {/* Readiness Score & Header Info */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-3xl font-semibold text-slate-900 mb-2 tracking-tight">Legal Intake Packet</h3>
                    <p className="text-sm text-slate-500 font-light">Generated on {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  
                  {/* Readiness Score */}
                  <div className="bg-white border border-purple-100 rounded-2xl p-5 flex items-center gap-5 min-w-[280px] max-w-sm shadow-sm relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent rounded-2xl pointer-events-none" />
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-purple-600"
                          strokeDasharray="72, 100"
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-slate-900 leading-none">72</span>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1.5">Readiness Score</p>
                      <p className="text-xs text-slate-600 leading-relaxed font-light">
                        Missing key dates and counterparty details. Gather before consultation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* A. Case Summary & B. Issue Type */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">A</span>
                      Case Summary
                    </h4>
                    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-indigo-600" />
                      <p className="text-[15px] text-slate-600 leading-relaxed font-light">
                        Client has uploaded a <span className="text-slate-900 font-medium">{documentTypes[selectedDocType].label.toLowerCase()}</span> regarding a <span className="text-slate-900 font-medium">{triageSummary.caseType.toLowerCase()}</span>. The document requires review to determine liability, obligations, and potential next steps. Immediate attention is needed to address any impending deadlines or required responses.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">B</span>
                        Issue Type
                      </h4>
                      <div className="inline-flex items-center px-5 py-3.5 rounded-xl bg-white border border-slate-200/60 text-sm font-medium text-slate-900 shadow-sm w-full">
                        {triageSummary.caseType}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">C</span>
                        Urgency
                      </h4>
                      <div className={`inline-flex items-center px-5 py-3.5 rounded-xl border text-sm font-bold shadow-sm w-full ${
                        triageSummary.urgency === 'Critical' ? 'bg-red-50/50 border-red-200 text-red-600' :
                        triageSummary.urgency === 'High' ? 'bg-orange-50/50 border-orange-200 text-orange-600' :
                        triageSummary.urgency === 'Medium' ? 'bg-purple-50/50 border-purple-200 text-purple-600' :
                        'bg-emerald-50/50 border-emerald-200 text-emerald-600'
                      }`}>
                        {triageSummary.urgency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* D. Timeline & E. Key Questions */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-300" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">D</span>
                      Timeline of Events
                    </h4>
                    <div className="space-y-8 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-slate-200">
                      {documentTypes[selectedDocType].packetData.timeline.map((event, i) => (
                        <div key={i} className="flex gap-5 relative z-10">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${i === 0 ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-white border-slate-300'}`}>
                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-purple-600' : 'bg-slate-300'}`} />
                          </div>
                          <p className={`text-[15px] pt-0.5 leading-relaxed ${i === 0 ? 'text-slate-900 font-medium' : 'text-slate-500 font-light'}`}>{event}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/50" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">E</span>
                      Key Questions for Lawyer
                    </h4>
                    <ul className="space-y-4">
                      {documentTypes[selectedDocType].packetData.questions.map((q, i) => (
                        <li key={i} className="flex items-start gap-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-sm">
                          <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-[15px] text-slate-600 leading-relaxed font-light">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* F. Checklist & G. Missing Info */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/50" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">F</span>
                      Supporting Documents
                    </h4>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-4 text-[15px] text-slate-900 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-medium">Uploaded {documentTypes[selectedDocType].label}</span>
                      </li>
                      {documentTypes[selectedDocType].packetData.checklist.map((item, i) => (
                        <li key={i} className="flex items-center gap-4 text-[15px] text-slate-500 p-4 rounded-xl hover:bg-slate-50 transition-colors font-light">
                          <div className="w-5 h-5 rounded border-2 border-slate-300 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/50" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">G</span>
                      Missing Information
                    </h4>
                    <ul className="space-y-4">
                      {triageSummary.missingInfo.map((info: string, i: number) => (
                        <li key={i} className="flex items-start gap-4 text-[15px] text-slate-600 bg-amber-50/50 p-5 rounded-xl border border-amber-100 font-light shadow-sm">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* H. Recommended Next Action */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/50" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                    <span className="w-6 h-6 rounded-md bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">H</span>
                    Recommended Next Action
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {documentTypes[selectedDocType].packetData.nextActions.map((action, i) => (
                      <div key={i} className="flex items-center gap-5 bg-slate-50/50 p-5 rounded-xl border border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group shadow-sm hover:shadow">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors shadow-sm">
                          <ArrowRight className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-[15px] font-medium text-slate-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgent Call Modal */}
      <AnimatePresence>
        {isUrgentCallModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-700/50 relative"
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium tracking-wide">Urgent Legal Call</h3>
                    <p className="text-sm text-slate-400 font-light mt-0.5">
                      {isConnectingUrgent ? "Connecting you to the next available legal professional..." : "Connected • Secure Video Session"}
                    </p>
                  </div>
                </div>
                {!isConnectingUrgent && (
                  <div className="px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-mono tracking-wider shadow-inner">
                    {formatDuration(callDuration)}
                  </div>
                )}
              </div>

              {/* Video Area */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                {isConnectingUrgent ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 mb-8">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
                      <div className="absolute inset-2 bg-purple-500/30 rounded-full animate-pulse" />
                      <div className="relative w-full h-full bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <Phone className="w-10 h-10 text-purple-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-400 animate-pulse font-light tracking-wide">Establishing secure connection...</p>
                  </div>
                ) : (
                  <>
                    {/* Main Video (Lawyer) */}
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <User className="w-32 h-32 text-slate-600/50" />
                      <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-sm text-white font-medium tracking-wide">Duty Lawyer (Verified)</span>
                      </div>
                    </div>

                    {/* Self View */}
                    <div className="absolute top-6 right-6 w-56 aspect-video bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-105">
                      {isVideoOff ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800/80 backdrop-blur-sm">
                          <User className="w-10 h-10 text-slate-600" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 relative">
                          <User className="w-16 h-16 text-slate-600/50" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 shadow-sm">
                        <span className="text-[11px] text-white font-medium tracking-wider uppercase">You</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="px-6 py-8 bg-slate-900 flex items-center justify-center gap-6">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  disabled={isConnectingUrgent}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isMuted 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                <button 
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  disabled={isConnectingUrgent}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isVideoOff 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                </button>

                <button 
                  disabled={isConnectingUrgent}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  <MessageSquare className="w-6 h-6" />
                </button>

                <div className="w-px h-10 bg-slate-800 mx-2" />

                <button
                  onClick={() => setIsUrgentCallModalOpen(false)}
                  className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all duration-300 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:-translate-y-0.5"
                >
                  <PhoneOff className="w-5 h-5" />
                  End Call
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Footer */}
      <footer className="bg-slate-950 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-serif font-bold text-white tracking-tight">Lion LawSense</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-light">
                Bridging the gap between legal clarity and professional support in Singapore through AI-guided triage and trusted partnerships.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">How it Works</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">AI Triage</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Teleconsultation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Our Partners</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-light">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm font-light">
              © {new Date().getFullYear()} Lion LawSense. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-purple-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-purple-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
