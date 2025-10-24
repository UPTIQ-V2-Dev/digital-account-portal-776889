import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Upload, File, CheckCircle, AlertCircle, X, Camera } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { accountOpeningService } from '@/services/account-opening';
import { Document, IdentificationDocumentType } from '@/types/account-opening';
import { toast } from 'sonner';

const DOCUMENT_TYPES: { value: IdentificationDocumentType; label: string; description: string }[] = [
    { value: 'drivers_license', label: "Driver's License", description: 'Government-issued photo ID' },
    { value: 'passport', label: 'Passport', description: 'Valid US or international passport' },
    { value: 'state_id', label: 'State ID', description: 'Government-issued state identification card' },
    { value: 'utility_bill', label: 'Utility Bill', description: 'Recent utility bill for address verification' },
    { value: 'bank_statement', label: 'Bank Statement', description: 'Recent bank statement' },
    {
        value: 'articles_incorporation',
        label: 'Articles of Incorporation',
        description: 'Business incorporation documents'
    }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const DocumentUploadPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [selectedDocumentType, setSelectedDocumentType] = useState<IdentificationDocumentType | ''>('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing documents
    const { data: existingDocuments, refetch } = useQuery({
        queryKey: ['documents', state.currentApplication?.id],
        queryFn: () => accountOpeningService.getDocuments(state.currentApplication!.id),
        enabled: !!state.currentApplication?.id
    });

    // Upload document mutation
    const uploadDocumentMutation = useMutation({
        mutationFn: (data: { file: File; documentType: IdentificationDocumentType }) =>
            accountOpeningService.uploadDocument({
                applicationId: state.currentApplication!.id,
                file: data.file,
                documentType: data.documentType
            }),
        onSuccess: () => {
            toast.success('Document uploaded successfully');
            refetch();
            setSelectedDocumentType('');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to upload document');
        }
    });

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (!selectedDocumentType) {
            toast.error('Please select a document type first');
            return;
        }

        const file = files[0];

        // Validate file
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size must be less than 10MB');
            return;
        }

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            toast.error('Please upload a valid image (JPG, PNG, WEBP) or PDF file');
            return;
        }

        uploadDocumentMutation.mutate({ file, documentType: selectedDocumentType });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleContinue = () => {
        completeStep('documents');
        const nextStep = getNextStep('documents', state.currentApplication!.accountType);
        if (nextStep) {
            setCurrentStep(nextStep);
            navigate(`/${nextStep.replace('_', '-')}`);
        }
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('documents', state.currentApplication!.accountType);
        if (previousStep) {
            setCurrentStep(previousStep);
            navigate(`/${previousStep.replace('_', '-')}`);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDocumentTypeInfo = (type: IdentificationDocumentType) => {
        return DOCUMENT_TYPES.find(dt => dt.value === type);
    };

    if (!state.currentApplication) {
        navigate('/application-type');
        return null;
    }

    const documents = existingDocuments?.success ? existingDocuments.data : [];

    return (
        <div className='p-6 md:p-8'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Upload className='h-5 w-5' />
                        Document Upload & Verification
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-6'>
                        {/* Document Type Selection */}
                        <div>
                            <Label htmlFor='documentType'>Document Type *</Label>
                            <Select
                                value={selectedDocumentType}
                                onValueChange={value => setSelectedDocumentType(value as IdentificationDocumentType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select document type' />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map(type => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            <div>
                                                <div className='font-medium'>{type.label}</div>
                                                <div className='text-sm text-gray-600'>{type.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <Label>Upload Document</Label>
                            <div
                                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                    dragActive
                                        ? 'border-blue-400 bg-blue-50'
                                        : selectedDocumentType
                                          ? 'border-gray-300 hover:border-gray-400'
                                          : 'border-gray-200 bg-gray-50'
                                } ${selectedDocumentType ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => selectedDocumentType && fileInputRef.current?.click()}
                            >
                                <div className='space-y-2'>
                                    <Upload
                                        className={`mx-auto h-12 w-12 ${selectedDocumentType ? 'text-gray-400' : 'text-gray-300'}`}
                                    />
                                    <div
                                        className={`text-lg font-medium ${selectedDocumentType ? 'text-gray-900' : 'text-gray-500'}`}
                                    >
                                        {selectedDocumentType
                                            ? 'Drop files here or click to browse'
                                            : 'Select document type first'}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        Supports: JPG, PNG, WEBP, PDF (max 10MB)
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    className='hidden'
                                    accept={ACCEPTED_FILE_TYPES.join(',')}
                                    onChange={e => handleFileSelect(e.target.files)}
                                    disabled={!selectedDocumentType}
                                />
                            </div>
                        </div>

                        {/* Camera Option (Mobile) */}
                        {selectedDocumentType && 'mediaDevices' in navigator && (
                            <div>
                                <Button
                                    type='button'
                                    variant='outline'
                                    className='w-full'
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.capture = 'environment';
                                        input.onchange = e => handleFileSelect((e.target as HTMLInputElement).files);
                                        input.click();
                                    }}
                                >
                                    <Camera className='mr-2 h-4 w-4' />
                                    Take Photo
                                </Button>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {uploadDocumentMutation.isPending && (
                            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                                <div className='flex items-center space-x-3'>
                                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                                    <div className='text-blue-800'>Uploading and verifying document...</div>
                                </div>
                            </div>
                        )}

                        {/* Uploaded Documents */}
                        {documents.length > 0 && (
                            <div>
                                <h3 className='text-lg font-semibold mb-4'>Uploaded Documents</h3>
                                <div className='space-y-3'>
                                    {documents.map((doc: Document) => {
                                        const typeInfo = getDocumentTypeInfo(doc.type);

                                        return (
                                            <Card key={doc.id}>
                                                <CardContent className='p-4'>
                                                    <div className='flex items-center justify-between'>
                                                        <div className='flex items-center space-x-3'>
                                                            <File className='h-8 w-8 text-blue-600' />
                                                            <div>
                                                                <div className='font-medium'>
                                                                    {typeInfo?.label || doc.type}
                                                                </div>
                                                                <div className='text-sm text-gray-600'>
                                                                    {doc.fileName} • {formatFileSize(doc.fileSize)}
                                                                </div>
                                                                <div className='text-xs text-gray-500'>
                                                                    Uploaded:{' '}
                                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className='flex items-center space-x-2'>
                                                            {doc.verificationStatus === 'verified' && (
                                                                <div className='flex items-center space-x-1 text-green-600'>
                                                                    <CheckCircle className='h-4 w-4' />
                                                                    <span className='text-sm'>Verified</span>
                                                                </div>
                                                            )}
                                                            {doc.verificationStatus === 'pending' && (
                                                                <div className='flex items-center space-x-1 text-yellow-600'>
                                                                    <AlertCircle className='h-4 w-4' />
                                                                    <span className='text-sm'>Pending</span>
                                                                </div>
                                                            )}
                                                            {doc.verificationStatus === 'failed' && (
                                                                <div className='flex items-center space-x-1 text-red-600'>
                                                                    <X className='h-4 w-4' />
                                                                    <span className='text-sm'>Failed</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {doc.verificationDetails?.issues &&
                                                        doc.verificationDetails.issues.length > 0 && (
                                                            <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded'>
                                                                <div className='text-sm text-red-800'>
                                                                    <div className='font-medium mb-1'>
                                                                        Issues found:
                                                                    </div>
                                                                    <ul className='list-disc list-inside'>
                                                                        {doc.verificationDetails.issues.map(
                                                                            (issue, index) => (
                                                                                <li key={index}>{issue}</li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Requirements Note */}
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                            <h4 className='font-medium text-blue-800 mb-2'>Document Requirements</h4>
                            <ul className='text-sm text-blue-700 space-y-1'>
                                <li>• Documents must be clear and fully visible</li>
                                <li>• All four corners of the document should be in frame</li>
                                <li>• Text should be readable and not blurry</li>
                                <li>• Documents should be current and not expired</li>
                                <li>• File size must not exceed 10MB</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className='flex justify-between pt-6'>
                <Button
                    variant='outline'
                    onClick={handleBack}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>
                <Button onClick={handleContinue}>
                    Continue
                    <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    );
};
