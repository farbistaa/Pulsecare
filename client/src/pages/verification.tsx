import { useState } from 'react';
import { 
  Shield, CheckCircle, XCircle, Clock, AlertTriangle, 
  FileText, User, Mail, Phone, MapPin, Heart, Home, Upload, Info
} from 'lucide-react';
import { Link } from 'wouter';

const VerificationPage: React.FC = () => {
  const [verificationType, setVerificationType] = useState<'donor' | 'hospital' | 'organization'>('donor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    documents: [] as File[],
    additionalInfo: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      setSubmissionStatus('success');
    }, 2000);
  };

  const verificationTypes = [
    {
      id: 'donor',
      title: 'Donor Verification',
      description: 'Verify your identity as a blood donor to increase trust and visibility in the system.',
      icon: User,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'hospital',
      title: 'Hospital Verification',
      description: 'Verify your healthcare facility to request blood and connect with verified donors.',
      icon: Heart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'organization',
      title: 'Organization Verification',
      description: 'Verify your non-profit or organization to organize blood donation drives.',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 px-4 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-lg shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Verification Process</h1>
                <p className="text-gray-300 mt-1">Verify your identity to build trust in the community</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!isSubmitted ? (
          <div className="space-y-8">
            {/* Verification Type Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-red-600" />
                Select Verification Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {verificationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setVerificationType(type.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] ${
                      verificationType === type.id
                        ? `${type.borderColor} bg-white shadow-md`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`${type.bgColor} p-2 rounded-lg shadow-sm`}>
                        <type.icon className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900">{type.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                {verificationTypes.find(t => t.id === verificationType)?.title} Application
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-red-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="+880 1XXX-XXXXXX"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="idNumber"
                          value={formData.idNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="National ID or Passport Number"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                        placeholder="Enter your full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-red-600" />
                    Required Documents
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 transition-all duration-300 hover:border-red-400 hover:bg-red-50">
                    <input
                      type="file"
                      id="documents"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label htmlFor="documents" className="cursor-pointer">
                      <div className="space-y-3">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-md">
                          <Upload className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">Upload documents</p>
                          <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB each</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {formData.documents.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Uploaded Documents:</p>
                      <div className="space-y-2">
                        {formData.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-red-100 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                <div className="text-xs text-gray-500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="p-2 rounded-full hover:bg-red-100 transition-colors duration-300"
                            >
                              <XCircle className="h-5 w-5 text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Additional Information
                  </h3>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Provide any additional information that may help with your verification..."
                  />
                </div>

                {/* Verification Requirements */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Verification Requirements
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>All information provided must be accurate and verifiable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Documents must be clear, valid, and not expired</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Verification process typically takes 3-5 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>You may be contacted for additional information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>False information may result in permanent account suspension</span>
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg flex items-center gap-2"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Submit Verification Request
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Submission Status */
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-10 text-center transform transition-all duration-300 hover:shadow-xl">
            {submissionStatus === 'pending' ? (
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md">
                  <Clock className="h-10 w-10 text-blue-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Submitting Your Application</h2>
                <p className="text-gray-600 max-w-md mx-auto">Please wait while we process your verification request...</p>
                <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            ) : submissionStatus === 'success' ? (
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Application Submitted Successfully!</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Thank you for your verification request. Our team will review your application within 3-5 business days.
                </p>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-left max-w-md mx-auto shadow-sm">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-green-600" />
                    What happens next?
                  </h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>You'll receive an email confirmation shortly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Our verification team will review your documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>You may be contacted for additional information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Once approved, your profile will show a verified badge</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/"
                  className="group relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Return to Home
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-md">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Submission Failed</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  There was an error submitting your application. Please try again later.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg"
                >
                  <span className="relative z-10">Try Again</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerificationPage;