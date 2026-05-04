'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingScreen from '@/components/loading-screen';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  businessType: z.string().optional(),
  investmentCapacity: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState<'email' | 'phone' | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<'email' | 'phone' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const businessType = watch('businessType');
  const investmentCapacity = watch('investmentCapacity');
  const emailFieldValue = watch('email');
  const phoneFieldValue = watch('phone');

  const sendOtp = async (type: 'email' | 'phone') => {
    const value = type === 'email' ? emailFieldValue : phoneFieldValue;
    if (!value) {
      toast.error(`Please enter your ${type} first.`);
      return;
    }

    setIsSendingOtp(type);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/register/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value }),
      });
      const data = await response.json();
      if (response.ok) {
        if (type === 'email') setIsEmailOtpSent(true);
        else setIsPhoneOtpSent(true);
        toast.success(data.message || 'OTP sent successfully!');
      } else {
        toast.error(data.detail || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP.');
    } finally {
      setIsSendingOtp(null);
    }
  };

  const verifyOtp = async (type: 'email' | 'phone') => {
    const value = type === 'email' ? emailFieldValue : phoneFieldValue;
    const otp = type === 'email' ? emailOtp : phoneOtp;

    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }

    setIsVerifying(type);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/register/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        if (type === 'email') setIsEmailVerified(true);
        else setIsPhoneVerified(true);
        toast.success(data.message || 'Verified successfully!');
      } else {
        toast.error(data.detail || 'Invalid OTP.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Verification failed.');
    } finally {
      setIsVerifying(null);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    if (!isEmailVerified || !isPhoneVerified) {
      toast.error('Please verify your email and phone number first.');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: data.name,
          email: data.email,
          phone_number: data.phone,
          business_type: data.businessType || '',
          investment_capacity: data.investmentCapacity || '',
          message: data.message,
          is_email_verified: isEmailVerified,
          is_phone_verified: isPhoneVerified,
          source_platform: 'NFIS',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        reset();
        setIsEmailVerified(false);
        setIsPhoneVerified(false);
        setIsEmailOtpSent(false);
        setIsPhoneOtpSent(false);
        setEmailOtp('');
        setPhoneOtp('');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const errorData = await response.json();
        const errorMsg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        toast.error(errorMsg || 'Failed to submit form.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting the form.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && <LoadingScreen />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about franchise opportunities? Our team is here to help you find the perfect business match.
          </p>
        </div>


        {/* Contact Form */}
        <div className="rounded-xl border bg-white shadow max-w-2xl mx-auto flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-100">
            <h3 className="font-semibold leading-none tracking-tight text-xl">Send us a Message</h3>
          </div>
          <div className="p-6 pt-6">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Thank You!</h3>
                <p className="text-green-700">
                  We've received your message and will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    placeholder="John Doe"
                    {...register('name')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  {(!isEmailOtpSent || isEmailVerified) ? (
                    <div className="flex gap-2 relative">
                      <div className="relative flex-1">
                        <input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          disabled={isEmailVerified}
                          {...register('email')}
                          className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 ${isEmailVerified ? 'bg-green-50 border-green-200' : 'bg-background'}`}
                        />
                      </div>
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={() => sendOtp('email')}
                          disabled={!emailFieldValue || isVerifying === 'email' || isSendingOtp === 'email'}
                          className="px-4 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px] h-10 mt-1"
                        >
                          {isSendingOtp === 'email' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send OTP'}
                        </button>
                      )}
                      {isEmailVerified && (
                        <div className="flex items-center text-green-600 font-semibold text-sm gap-1 h-10 mt-1">
                          <CheckCircle size={18} /> Verified
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 relative mt-1">
                      <div className="relative flex-1">
                        <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter Email OTP"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background"
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => verifyOtp('email')}
                        disabled={isVerifying === 'email'}
                        className="px-4 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px] h-10"
                      >
                        {isVerifying === 'email' ? '...' : 'Verify'}
                      </button>
                    </div>
                  )}
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number *
                  </label>
                  {(!isPhoneOtpSent || isPhoneVerified) ? (
                    <div className="flex gap-2 relative">
                      <div className="relative flex-1">
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+91 98205 31096"
                          disabled={isPhoneVerified}
                          {...register('phone')}
                          className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 ${isPhoneVerified ? 'bg-green-50 border-green-200' : 'bg-background'}`}
                        />
                      </div>
                      {!isPhoneVerified && (
                        <button
                          type="button"
                          onClick={() => sendOtp('phone')}
                          disabled={!phoneFieldValue || isVerifying === 'phone' || isSendingOtp === 'phone'}
                          className="px-4 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px] h-10 mt-1"
                        >
                          {isSendingOtp === 'phone' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send OTP'}
                        </button>
                      )}
                      {isPhoneVerified && (
                        <div className="flex items-center text-green-600 font-semibold text-sm gap-1 h-10 mt-1">
                          <CheckCircle size={18} /> Verified
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 relative mt-1">
                      <div className="relative flex-1">
                        <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter Phone OTP"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background"
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => verifyOtp('phone')}
                        disabled={isVerifying === 'phone'}
                        className="px-4 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px] h-10"
                      >
                        {isVerifying === 'phone' ? '...' : 'Verify'}
                      </button>
                    </div>
                  )}
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                {/* Business Type */}
                <div>
                  <label htmlFor="businessType" className="text-sm font-medium text-foreground">
                    Business Type (Optional)
                  </label>
                  <select
                    id="businessType"
                    {...register('businessType')}
                    onChange={(e) => setValue('businessType', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="">Select a business type</option>
                    <option value="Food & QSR">Food & QSR</option>
                    <option value="Health, Fitness & Wellness">Health, Fitness & Wellness</option>
                    <option value="Education & Training">Education & Training</option>
                    <option value="Retail & Lifestyle">Retail & Lifestyle</option>
                    <option value="Hospitality & Stay">Hospitality & Stay</option>
                    <option value="Kids & Entertainment">Kids & Entertainment</option>
                    <option value="Automobile & EV">Automobile & EV</option>
                    <option value="Business Services">Business Services</option>
                    <option value="Home Services & Real Estate Allied">Home Services & Real Estate Allied</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Investment Capacity */}
                <div>
                  <label htmlFor="investmentCapacity" className="text-sm font-medium text-foreground">
                    Investment Capacity (Optional)
                  </label>
                  <select
                    id="investmentCapacity"
                    {...register('investmentCapacity')}
                    onChange={(e) => setValue('investmentCapacity', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="">Select investment range</option>
                    <option value="Up to ₹25 Lakhs">Up to ₹25 Lakhs</option>
                    <option value="₹25 Lakhs - ₹50 Lakhs">₹25 Lakhs - ₹50 Lakhs</option>
                    <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                    <option value="₹1 Crore - ₹2.5 Crores">₹1 Crore - ₹2.5 Crores</option>
                    <option value="₹2.5 Crores - ₹5 Crores">₹2.5 Crores - ₹5 Crores</option>
                    <option value="₹5 Crores+">₹5 Crores+</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    placeholder="Tell us about your franchise interests and goals..."
                    {...register('message')}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 resize-none"
                    rows={6}
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isEmailVerified || !isPhoneVerified}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
