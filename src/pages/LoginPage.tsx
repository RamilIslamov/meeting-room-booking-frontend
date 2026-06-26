import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface FormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<FormValues>();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const auth = await loginApi(values.email, values.password);
      setSession(auth);
      navigate(auth.role === 'ADMIN' ? '/admin/dashboard' : '/rooms');
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)}>
        <h1>Sign in</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <label>
          Email
          <input type="email" autoComplete="username" {...register('email', { required: 'Email is required' })} />
          {formState.errors.email && <span className="field-error">{formState.errors.email.message}</span>}
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} />
          {formState.errors.password && <span className="field-error">{formState.errors.password.message}</span>}
        </label>
        <button type="submit" className="btn btn-primary" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
