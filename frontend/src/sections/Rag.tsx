import React from "react"
import { useState } from "react"
import axios from 'axios'

const Rag = () => {
    const [query, setQuery] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState('')
    const [fileName, setFileName] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setFileName(selectedFile.name)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!file || !query.trim()) {
            alert('Please select a file and enter a question')
            return
        }

        const formData = new FormData()
        formData.append('context', file)
        formData.append('question', query)

        try {
            setIsLoading(true)
            setResponse('')
            const res = await axios.post('https://mindpages.onrender.com/bot', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            const data = await res.data
            setResponse(data.bot_ans || data.error || 'No response received')
        } catch (error) {
            console.error('Error asking bot', error)
            setResponse('Sorry, there was an error processing your request. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const removeFile = () => {
        setFile(null)
        setFileName('')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:cursor-pointer">

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* File Upload Area */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Document
                                </label>

                                {!file ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                                        <div className="space-y-4">
                                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="file-upload"
                                                    className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                                                >
                                                    Click to upload
                                                </label>
                                                <p className="text-sm text-gray-600">or drag and drop</p>
                                                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT files supported</p>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleFileChange}
                                            id="file-upload"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{fileName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Question Input */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Your Question
                                </label>
                                <textarea
                                    placeholder="Ask anything about your document... (e.g., 'Summarize the main points', 'What are the key findings?')"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={4}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !file || !query.trim()}
                                className="w-full bg-black text-white font-medium py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2 hover:cursor-pointer">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Ask our AI</span>
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Response Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            AI Response
                        </h2>

                        <div className="min-h-[400px]">
                            {!response && !isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">No response yet</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Upload a document and ask a question to get started
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-4">
                                        <div className="mx-auto w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                        <div>
                                            <p className="text-gray-600 font-medium">Analyzing your document...</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                This may take a few moments
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                                {response}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <p className="text-sm text-gray-500">
                        Powered by AI • Secure and private document processing
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Rag