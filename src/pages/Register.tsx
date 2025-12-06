import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Eye, EyeOff, Upload } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole.PROFESSOR | UserRole.STUDENT>(UserRole.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      fullName: '',
      userId: '',
      levelDesign: '',
      branchDept: '',
      dobAddress: '',
      sectionOffice: '',
      email: '',
      phone: '',
      password: ''
  });

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setFileName(e.target.files[0].name);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Registration successful! Please sign in.");
      navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f6cbd] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-[#0f6cbd] p-8">
        <h1 className="text-center text-3xl font-bold text-[#1a1a2e] mb-8">Create account</h1>

        {/* Role Toggle */}
        <div className="flex justify-center mb-8">
            <div className="bg-[#5ea5de] rounded-lg p-1 flex w-64">
                <button 
                    onClick={() => setRole(UserRole.PROFESSOR)}
                    type="button"
                    className={`flex-1 py-1 rounded-md text-sm font-medium transition-all ${role === UserRole.PROFESSOR ? 'bg-[#9ac9f3] text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
                >
                    Professor
                </button>
                <button 
                    onClick={() => setRole(UserRole.STUDENT)}
                    type="button"
                    className={`flex-1 py-1 rounded-md text-sm font-medium transition-all ${role === UserRole.STUDENT ? 'bg-[#9ac9f3] text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
                >
                    Student
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Row 1 */}
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">Full Name</label>
                <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder={role === UserRole.STUDENT ? "Biyazova Sabina" : "Akobir"}
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">User ID</label>
                <input 
                    type="text" 
                    value={formData.userId}
                    onChange={(e) => handleChange('userId', e.target.value)}
                    placeholder={role === UserRole.STUDENT ? "U2010069" : "U250017"}
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>

            {/* Row 2 */}
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">{role === UserRole.STUDENT ? 'Level' : 'Design'}</label>
                <input 
                    type="text" 
                    value={formData.levelDesign}
                    onChange={(e) => handleChange('levelDesign', e.target.value)}
                    placeholder={role === UserRole.STUDENT ? "Junior" : "Head"}
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">{role === UserRole.STUDENT ? 'Branch' : 'Department'}</label>
                <input 
                    type="text" 
                    value={formData.branchDept}
                    onChange={(e) => handleChange('branchDept', e.target.value)}
                    placeholder={role === UserRole.STUDENT ? "CSE" : "SBL"}
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>

            {/* Row 3 */}
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">{role === UserRole.STUDENT ? 'Date of Birth' : 'Address'}</label>
                <input 
                    type="text" 
                    value={formData.dobAddress}
                    onChange={(e) => handleChange('dobAddress', e.target.value)}
                    placeholder={role === UserRole.STUDENT ? "DD/MM/YY" : "Chilanzar"}
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">{role === UserRole.STUDENT ? 'Section' : 'Office location'}</label>
                <input 
                    type="text" 
                    value={formData.sectionOffice}
                    onChange={(e) => handleChange('sectionOffice', e.target.value)}
                    placeholder={role === UserRole.STUDENT ? "002" : "OH"}
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>

            {/* Row 4 */}
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">Email</label>
                <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="freecannabis@gmail.com"
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">Telephone number</label>
                <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+998"
                    className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>

             {/* Row 5 - Password & Fingerprint */}
             <div>
                <label className="block text-sm text-[#1a1a2e] mb-1">Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#bfdcf5] border-none rounded p-3 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
            </div>
            <div className="flex items-end">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <button 
                    type="button" 
                    onClick={handleFileClick}
                    className="w-full bg-[#2a4580] hover:bg-[#1e3463] text-white py-3 rounded shadow-md transition-colors flex items-center justify-center gap-2"
                >
                    <Upload size={18} />
                    {fileName ? `Selected: ${fileName}` : 'Upload your fingerprint'}
                </button>
            </div>

            {/* Sign Up Button */}
            <div className="col-span-2 flex flex-col items-center mt-6">
                <button type="submit" className="bg-[#0b1f41] hover:bg-black text-white px-16 py-3 rounded shadow-lg transition-transform active:scale-95">
                    Sign up
                </button>
                <div className="mt-4 text-sm text-[#1a1a2e]">
                    Already have an account? <span onClick={() => navigate('/login')} className="font-bold underline cursor-pointer">Log in</span>
                </div>
            </div>

        </form>
      </div>
    </div>
  );
};