import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  UserPlus, 
  ArrowLeft, 
  Save, 
  Loader,
  Eye,
  EyeOff,
  Home,
  Mail,
  Phone,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { createMemberDirect } from '../../api/http'

export function CreateMember() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    flatNumber: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getPasswordStrength = () => {
    const pwd = formData.password
    if (!pwd) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (pwd.length >= 8) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    
    const strengths = [
      { score: 0, label: 'Very Weak', color: 'bg-destructive/50' },
      { score: 1, label: 'Weak', color: 'bg-orange-500/50' },
      { score: 2, label: 'Fair', color: 'bg-yellow-500/50' },
      { score: 3, label: 'Good', color: 'bg-blue-500/50' },
      { score: 4, label: 'Strong', color: 'bg-success/50' }
    ]
    
    return strengths[score] || strengths[0]
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = '10-digit phone number required'
    }

    if (!formData.flatNumber.trim()) {
      newErrors.flatNumber = 'Flat number is required'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password needs lowercase letters'
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password needs uppercase letters'
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password needs numbers'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix all errors before submitting')
      return
    }

    try {
      setLoading(true)
      const response = await createMemberDirect(formData)

      if (response.ok) {
        toast.success('Member created successfully!')
        setTimeout(() => {
          navigate('/members')
        }, 1000)
      } else {
        toast.error('Failed to create member')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all mb-6 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Create Member</h1>
                <p className="text-slate-600 mt-0.5">Add a new resident to your society</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-200/80">
          
          {/* Form Sections */}
          <div className="p-8 sm:p-10 space-y-8">
            
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (errors.name) setErrors({ ...errors, name: '' })
                      }}
                      placeholder="Rahul Sharma"
                      className={cn(
                        "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all duration-200",
                        "focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20",
                        errors.name ? "border-destructive bg-destructive/5 focus:border-destructive" : "border-slate-200 hover:border-slate-300 focus:border-primary"
                      )}
                    />
                  </div>
                  {errors.name && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{errors.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                      placeholder="rahul@example.com"
                      className={cn(
                        "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all duration-200",
                        "focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20",
                        errors.email ? "border-destructive bg-destructive/5 focus:border-destructive" : "border-slate-200 hover:border-slate-300 focus:border-primary"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value })
                        if (errors.phone) setErrors({ ...errors, phone: '' })
                      }}
                      placeholder="9876543210"
                      className={cn(
                        "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all duration-200",
                        "focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20",
                        errors.phone ? "border-destructive bg-destructive/5 focus:border-destructive" : "border-slate-200 hover:border-slate-300 focus:border-primary"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{errors.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Property Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Property Information</h2>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Flat Number <span className="text-destructive">*</span>
                </label>
                <div className="relative group">
                  <Home className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={formData.flatNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, flatNumber: e.target.value })
                      if (errors.flatNumber) setErrors({ ...errors, flatNumber: '' })
                    }}
                    placeholder="e.g., A-101, Wing-B 202"
                    className={cn(
                      "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all duration-200",
                      "focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20",
                      errors.flatNumber ? "border-destructive bg-destructive/5 focus:border-destructive" : "border-slate-200 hover:border-slate-300 focus:border-primary"
                    )}
                  />
                </div>
                {errors.flatNumber && (
                  <div className="flex items-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{errors.flatNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Security Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Security</h2>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      if (errors.password) setErrors({ ...errors, password: '' })
                    }}
                    placeholder="Create a strong password"
                    className={cn(
                      "w-full pl-12 pr-12 py-3 rounded-xl border-2 bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all duration-200",
                      "focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20",
                      errors.password ? "border-destructive bg-destructive/5 focus:border-destructive" : "border-slate-200 hover:border-slate-300 focus:border-primary"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">Password Strength</span>
                      <span className={cn("text-xs font-bold", {
                        'text-destructive': getPasswordStrength().score < 2,
                        'text-orange-500': getPasswordStrength().score === 2,
                        'text-blue-500': getPasswordStrength().score === 3,
                        'text-success': getPasswordStrength().score === 4,
                      })}>
                        {getPasswordStrength().label}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-300", getPasswordStrength().color)}
                        style={{ width: `${(getPasswordStrength().score / 4) * 100}%` }}
                      />
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 mt-3">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className={cn("w-3.5 h-3.5", formData.password.length >= 8 ? "text-success" : "text-slate-300")} />
                        <span>Minimum 8 characters</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className={cn("w-3.5 h-3.5", /[a-z]/.test(formData.password) ? "text-success" : "text-slate-300")} />
                        <span>Lowercase letter</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className={cn("w-3.5 h-3.5", /[A-Z]/.test(formData.password) ? "text-success" : "text-slate-300")} />
                        <span>Uppercase letter</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className={cn("w-3.5 h-3.5", /\d/.test(formData.password) ? "text-success" : "text-slate-300")} />
                        <span>Number</span>
                      </li>
                    </ul>
                  </div>
                )}

                {errors.password && (
                  <div className="flex items-center gap-2 mt-3 text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{errors.password}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary mb-2">Member will be created with:</p>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span><strong>Active status</strong> - Can login immediately</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>Access to <strong>mobile app</strong> using email & password</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span><strong>Audit logged</strong> for security tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 sm:px-10 py-6 bg-slate-50/50 border-t border-slate-200 flex gap-3 justify-end">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={cn(
                "inline-flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white transition-all shadow-lg",
                loading 
                  ? "bg-slate-400 cursor-not-allowed opacity-75" 
                  : "bg-primary hover:bg-primary/90 active:scale-[0.98] shadow-primary/30 hover:shadow-primary/40"
              )}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Member</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Text */}
        <p className="text-center text-xs text-slate-500 mt-6">
          All member data is securely encrypted and stored
        </p>
      </div>
    </div>
  )
}
