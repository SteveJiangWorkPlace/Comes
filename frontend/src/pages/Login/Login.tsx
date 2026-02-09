/**
 * Login page
 * Reference Otium_wip login interface design
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '../../hooks'
import Card from '../../components/ui/Card/Card'
import Input from '../../components/ui/Input/Input'
import Button from '../../components/ui/Button/Button'
import Icon from '../../components/ui/Icon/Icon'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form state using custom hook
  const { form, errors, touched, handleChange, handleBlur, setFieldError, validate, reset } =
    useForm({
      username: '',
      password: '',
    })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/module1'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Form validation rules
  const validateForm = () => {
    const validators = {
      username: (value: string) => {
        if (!value.trim()) return '用户名不能为空'
        if (value.length < 3) return '用户名至少3个字符'
        if (value.length > 50) return '用户名不能超过50个字符'
        return null
      },
      password: (value: string) => {
        if (!value.trim()) return '密码不能为空'
        if (value.length < 6) return '密码至少6个字符'
        return null
      },
    }

    return validate(validators)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      await login({
        username: form.username,
        password: form.password,
        rememberMe,
      })
    } catch (err) {
      // Error is handled by auth store
      console.error('Login error:', err)
    }
  }

  // Handle demo login
  const handleDemoLogin = async () => {
    clearError()
    reset()

    try {
      await login({
        username: 'demo',
        password: 'demopassword',
        rememberMe: false,
      })
    } catch (err) {
      console.error('Demo login error:', err)
    }
  }

  // Handle admin login
  const handleAdminLogin = async () => {
    clearError()
    reset()

    try {
      await login({
        username: 'admin',
        password: 'adminpassword',
        rememberMe: false,
      })
    } catch (err) {
      console.error('Admin login error:', err)
    }
  }

  // Handle forgot password
  const handleForgotPassword = () => {
    alert('密码重置功能待实现')
  }

  // Handle register
  const handleRegister = () => {
    navigate('/register')
  }

  const isFormValid =
    form.username.trim() && form.password.trim() && !errors.username && !errors.password

  return (
    <div className={styles.container}>
      {/* Background decorative elements */}
      <div className={styles.background}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>

      {/* Main login card */}
      <Card className={styles.loginCard} variant="elevated">
        {/* Logo and title section */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <Icon name="rocket" size="xl" variant="primary" />
            <h1 className={styles.title}>Comes</h1>
          </div>
          <p className={styles.subtitle}>项目管理和协作平台</p>
          <p className={styles.description}>欢迎回来，请登录您的账户以继续使用平台功能</p>
        </div>

        {/* Login form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Username field */}
          <div className={styles.formGroup}>
            <Input
              type="text"
              label="用户名"
              placeholder="请输入用户名"
              value={form.username}
              onChange={e => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              error={touched.username && !!errors.username}
              errorMessage={errors.username}
              leftIcon={<Icon name="user" />}
              size="large"
              fullWidth
              autoComplete="username"
              autoFocus
            />
          </div>

          {/* Password field */}
          <div className={styles.formGroup}>
            <Input
              type={showPassword ? 'text' : 'password'}
              label="密码"
              placeholder="请输入密码"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && !!errors.password}
              errorMessage={errors.password}
              leftIcon={<Icon name="lock" />}
              rightIcon={
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  <Icon name={showPassword ? 'eyeInvisible' : 'eye'} />
                </button>
              }
              size="large"
              fullWidth
              autoComplete="current-password"
            />
          </div>

          {/* Remember me and forgot password */}
          <div className={styles.optionsRow}>
            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              <span>记住登录状态</span>
            </label>

            <button type="button" className={styles.forgotPassword} onClick={handleForgotPassword}>
              忘记密码？
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className={styles.errorMessage}>
              <Icon name="warning" variant="error" />
              <span>{error}</span>
            </div>
          )}

          {/* Login button */}
          <div className={styles.buttonGroup}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={!isFormValid || isLoading}
              fullWidth
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </div>

          {/* Demo login buttons */}
          <div className={styles.demoButtons}>
            <p className={styles.demoLabel}>快速体验：</p>
            <div className={styles.demoButtonGroup}>
              <Button
                type="button"
                variant="secondary"
                size="medium"
                onClick={handleDemoLogin}
                disabled={isLoading}
                leftIcon={<Icon name="user" />}
              >
                演示用户登录
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="medium"
                onClick={handleAdminLogin}
                disabled={isLoading}
                leftIcon={<Icon name="setting" />}
              >
                管理员登录
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerText}>或</span>
          </div>

          {/* Register link */}
          <div className={styles.registerSection}>
            <p className={styles.registerText}>还没有账户？</p>
            <Button type="button" variant="ghost" onClick={handleRegister} disabled={isLoading}>
              立即注册
            </Button>
          </div>
        </form>

        {/* Footer info */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Comes 项目. 保留所有权利.
          </p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>
              服务条款
            </a>
            <span className={styles.footerSeparator}>·</span>
            <a href="#" className={styles.footerLink}>
              隐私政策
            </a>
            <span className={styles.footerSeparator}>·</span>
            <a href="#" className={styles.footerLink}>
              帮助中心
            </a>
          </div>
        </div>
      </Card>

      {/* Version info */}
      <div className={styles.versionInfo}>
        <span>版本 1.0.0</span>
        <span className={styles.versionSeparator}>|</span>
        <span>开发预览版</span>
      </div>
    </div>
  )
}

export default Login
